package com.ridemada.presentation.viewmodel

import androidx.compose.runtime.*
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.local.SessionDataStore
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.UpdateProfileRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class EditProfileViewModel @Inject constructor(
    private val api: RideMadaApi,
    private val session: SessionDataStore,
) : ViewModel() {
    private val _loading = MutableStateFlow(false)
    val loading = _loading.asStateFlow()
    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    private val _name = MutableStateFlow("")
    val name = _name.asStateFlow()
    private val _email = MutableStateFlow("")
    val email = _email.asStateFlow()

    init {
        viewModelScope.launch {
            session.getUser()?.let {
                _name.value = it.name
                _email.value = it.email.orEmpty()
            }
        }
    }

    fun save(name: String, email: String, onDone: () -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            runCatching { api.updateProfile(UpdateProfileRequest(name = name, email = email.ifBlank { null })) }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        response.body()?.user?.let { user ->
                            val token = session.getAccessToken().orEmpty()
                            val refresh = session.getRefreshToken().orEmpty()
                            session.saveSession(token, refresh, user)
                        }
                        onDone()
                    } else {
                        _error.value = response.message()
                    }
                }
                .onFailure { _error.value = it.message }
            _loading.value = false
        }
    }
}
