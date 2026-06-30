package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.firebase.messaging.FirebaseMessaging
import com.ridemada.domain.repository.AuthRepository
import com.ridemada.utils.NetworkConnectivityObserver
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MainViewModel @Inject constructor(
    val networkObserver: NetworkConnectivityObserver,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _userRole = kotlinx.coroutines.flow.MutableStateFlow<String?>(null)
    val userRole = _userRole.asStateFlow()

    init {
        viewModelScope.launch {
            _userRole.value = authRepository.getCurrentUser()?.role
        }
    }

    fun syncFcmToken() {
        viewModelScope.launch {
            if (!authRepository.isLoggedIn()) return@launch
            refreshRole()
            FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    val token = task.result ?: return@addOnCompleteListener
                    viewModelScope.launch {
                        runCatching { authRepository.updateFcmToken(token) }
                    }
                }
            }
        }
    }

    fun refreshRole() {
        viewModelScope.launch {
            _userRole.value = authRepository.getCurrentUser()?.role
        }
    }
}
