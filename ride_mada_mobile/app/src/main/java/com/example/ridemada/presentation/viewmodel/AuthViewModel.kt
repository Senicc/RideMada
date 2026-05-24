package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.dto.AuthResponse
import com.ridemada.domain.repository.AuthRepository
import com.ridemada.domain.usecase.LoginUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase,
    private val authRepository: AuthRepository,
) : ViewModel() {

    private val _authState = MutableStateFlow<AuthState>(AuthState.Idle)
    val authState = _authState.asStateFlow()

    private val _pendingPhone = MutableStateFlow<String?>(null)
    val pendingPhone = _pendingPhone.asStateFlow()

    fun login(phone: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            runCatching { loginUseCase(phone, password) }
                .onSuccess { response ->
                    when {
                        response.requiresVerification == true -> {
                            _pendingPhone.value = phone
                            _authState.value = AuthState.NeedsOtp(phone)
                        }
                        response.success -> _authState.value = AuthState.Success
                        else -> _authState.value = AuthState.Error(response.message ?: "Connexion échouée")
                    }
                }
                .onFailure { e ->
                    _authState.value = AuthState.Error(e.message ?: "Erreur de connexion")
                }
        }
    }

    fun register(name: String, phone: String, password: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            runCatching { authRepository.register(name, phone, password) }
                .onSuccess { response ->
                    if (response.success) {
                        _pendingPhone.value = phone
                        _authState.value = AuthState.NeedsOtp(phone)
                    } else {
                        _authState.value = AuthState.Error(response.message ?: "Inscription échouée")
                    }
                }
                .onFailure { e ->
                    _authState.value = AuthState.Error(e.message ?: "Erreur réseau")
                }
        }
    }

    fun verifyOtp(phone: String, otp: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            runCatching { authRepository.verifyOtp(phone, otp) }
                .onSuccess { response ->
                    if (response.success) _authState.value = AuthState.Success
                    else _authState.value = AuthState.Error(response.message ?: "OTP invalide")
                }
                .onFailure { e ->
                    _authState.value = AuthState.Error(e.message ?: "Erreur OTP")
                }
        }
    }

    fun resetPassword(phone: String, otp: String, newPassword: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            runCatching { authRepository.resetPassword(phone, otp, newPassword) }
                .onSuccess { response ->
                    if (response.success) {
                        _authState.value = AuthState.PasswordResetSuccess
                    } else {
                        _authState.value = AuthState.Error(response.message ?: "Échec réinitialisation")
                    }
                }
                .onFailure { e ->
                    _authState.value = AuthState.Error(e.message ?: "Erreur")
                }
        }
    }

    fun forgotPassword(phone: String) {
        viewModelScope.launch {
            _authState.value = AuthState.Loading
            runCatching { authRepository.forgotPassword(phone) }
                .onSuccess {
                    _pendingPhone.value = phone
                    _authState.value = AuthState.ForgotPasswordSent(phone)
                }
                .onFailure { e ->
                    _authState.value = AuthState.Error(e.message ?: "Erreur")
                }
        }
    }

    fun checkSession(onResult: (Boolean, String?) -> Unit) {
        viewModelScope.launch {
            val loggedIn = authRepository.isLoggedIn()
            if (loggedIn) authRepository.restoreSession()
            val role = authRepository.getCurrentUser()?.role
            onResult(loggedIn, role)
        }
    }

    suspend fun currentUserRole(): String? = authRepository.getCurrentUser()?.role

    fun logout() {
        viewModelScope.launch {
            authRepository.clearSession()
            _authState.value = AuthState.Idle
        }
    }

    fun resetState() {
        _authState.value = AuthState.Idle
    }
}

sealed class AuthState {
    data object Idle : AuthState()
    data object Loading : AuthState()
    data object Success : AuthState()
    data class NeedsOtp(val phone: String) : AuthState()
    data class ForgotPasswordSent(val phone: String) : AuthState()
    data object PasswordResetSuccess : AuthState()
    data class Error(val message: String) : AuthState()
}
