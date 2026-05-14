package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState = _authState.asStateFlow()

    fun login(phone: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            try {
                val response = authRepository.login(phone, password)
                if (response.success) {
                    _authState.value = AuthState.Success(response)
                } else {
                    _authState.value = AuthState.Error(response.message ?: "Erreur inconnue")
                }
            } catch (e: Exception) {
                _authState.value = AuthState.Error(e.message ?: "Erreur de connexion")
            }
        }
    }

    fun register(name: String, phone: String, password: String) {
        // Implémentation similaire
    }

    fun updateFcmToken(token: String) {
        viewModelScope.launch {
            try {
                authRepository.updateFcmToken(token)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }
}

sealed class AuthState {
    data object Idle : AuthState()
    data object Loading : AuthState()
    data class Success(val data: Any) : AuthState()
    data class Error(val message: String) : AuthState()
}