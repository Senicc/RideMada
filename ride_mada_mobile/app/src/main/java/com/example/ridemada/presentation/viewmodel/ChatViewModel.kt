package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.MessageDto
import com.ridemada.data.remote.dto.MessageRequest
import com.ridemada.domain.repository.AuthRepository
import com.ridemada.services.SocketService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONObject
import javax.inject.Inject

data class ChatMessageUi(
    val id: String,
    val content: String,
    val isFromCurrentUser: Boolean,
)

@HiltViewModel
class ChatViewModel @Inject constructor(
    private val api: RideMadaApi,
    private val authRepository: AuthRepository,
    private val socketService: SocketService,
) : ViewModel() {

    private val _messages = MutableStateFlow<List<ChatMessageUi>>(emptyList())
    val messages = _messages.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    private var listening = false

    fun loadChat(receiverId: String, rideId: String) {
        if (receiverId.isBlank()) return
        if (rideId.isNotBlank()) {
            socketService.joinRideRoom(rideId)
        }
        setupSocketListener()
        viewModelScope.launch {
            val myId = authRepository.getCurrentUser()?.id
            runCatching { api.getChat(receiverId) }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        _messages.value = response.body()?.messages?.map { it.toUi(myId) } ?: emptyList()
                    } else {
                        _error.value = "Impossible de charger la conversation"
                    }
                }
                .onFailure { _error.value = it.message }
        }
    }

    private fun setupSocketListener() {
        if (listening) return
        listening = true
        socketService.setOnNewMessage { json ->
            viewModelScope.launch {
                val myId = authRepository.getCurrentUser()?.id
                appendFromSocket(json, myId)
            }
        }
    }

    private fun appendFromSocket(json: JSONObject, myId: String?) {
        val id = json.optString("id", System.currentTimeMillis().toString())
        val content = json.optString("content", "")
        val senderId = json.optString("senderId", "")
        if (content.isBlank()) return
        val ui = ChatMessageUi(id, content, senderId == myId)
        if (_messages.value.none { it.id == id }) {
            _messages.value = _messages.value + ui
        }
    }

    fun sendMessage(receiverId: String, content: String, rideId: String) {
        viewModelScope.launch {
            val myId = authRepository.getCurrentUser()?.id.orEmpty()
            _messages.value = _messages.value + ChatMessageUi(
                id = System.currentTimeMillis().toString(),
                content = content,
                isFromCurrentUser = true,
            )
            socketService.sendMessage(receiverId, content, rideId.ifBlank { null })
            runCatching {
                api.sendMessage(MessageRequest(receiverId, content, rideId.ifBlank { null }))
            }
        }
    }

    private fun MessageDto.toUi(currentUserId: String?) = ChatMessageUi(
        id = id,
        content = content,
        isFromCurrentUser = senderId == currentUserId,
    )
}
