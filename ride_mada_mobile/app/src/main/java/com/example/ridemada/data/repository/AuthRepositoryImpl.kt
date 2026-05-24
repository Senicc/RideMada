package com.ridemada.data.repository

import com.ridemada.data.local.SessionDataStore
import com.ridemada.data.local.TokenManager
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.*
import com.ridemada.domain.repository.AuthRepository
import com.ridemada.services.SocketService
import javax.inject.Inject

class AuthRepositoryImpl @Inject constructor(
    private val api: RideMadaApi,
    private val tokenManager: TokenManager,
    private val session: SessionDataStore,
    private val socketService: SocketService,
) : AuthRepository {

    private fun parseError(response: retrofit2.Response<*>): String =
        response.errorBody()?.string()?.takeIf { it.isNotBlank() }
            ?: response.message().takeIf { !it.isNullOrBlank() }
            ?: "Erreur réseau (${response.code()})"

    override suspend fun login(phone: String, password: String): AuthResponse {
        val response = api.login(LoginRequest(phone, password))
        val body = response.body()
        if (!response.isSuccessful || body == null) throw Exception(parseError(response))
        if (body.success && body.accessToken != null && body.user != null) {
            saveSession(body.accessToken, body.refreshToken.orEmpty(), body.user)
        }
        return body
    }

    override suspend fun register(name: String, phone: String, password: String): AuthResponse {
        val response = api.register(RegisterRequest(name, phone, password))
        val body = response.body()
        if (!response.isSuccessful || body == null) throw Exception(parseError(response))
        return body
    }

    override suspend fun verifyOtp(phone: String, otp: String): AuthResponse {
        val response = api.verifyOtp(OtpRequest(phone, otp))
        val body = response.body()
        if (!response.isSuccessful || body == null) throw Exception(parseError(response))
        if (body.success && body.accessToken != null && body.user != null) {
            saveSession(body.accessToken, body.refreshToken.orEmpty(), body.user)
        }
        return body
    }

    override suspend fun forgotPassword(phone: String): AuthResponse {
        val response = api.forgotPassword(ForgotPasswordRequest(phone))
        val body = response.body()
        if (!response.isSuccessful || body == null) throw Exception(parseError(response))
        return body
    }

    override suspend fun resetPassword(phone: String, otp: String, newPassword: String): AuthResponse {
        val response = api.resetPassword(ResetPasswordRequest(phone, otp, newPassword))
        val body = response.body()
        if (!response.isSuccessful || body == null) throw Exception(parseError(response))
        return body
    }

    override suspend fun updateFcmToken(token: String) {
        runCatching { api.updateFcmToken(FcmTokenRequest(token)) }
    }

    override suspend fun saveSession(accessToken: String, refreshToken: String, user: UserDto) {
        tokenManager.persist(accessToken, refreshToken, user)
        socketService.connect(accessToken)
    }

    override suspend fun clearSession() {
        socketService.disconnect()
        tokenManager.clear()
    }

    override suspend fun getAccessToken(): String? {
        if (tokenManager.accessToken == null) tokenManager.loadFromStorage()
        return tokenManager.accessToken
    }

    override suspend fun getCurrentUser(): UserDto? = session.getUser()

    override suspend fun isLoggedIn(): Boolean {
        if (tokenManager.accessToken == null) tokenManager.loadFromStorage()
        return tokenManager.accessToken != null
    }

    override suspend fun restoreSession() {
        tokenManager.loadFromStorage()
        val token = tokenManager.accessToken ?: return
        socketService.connect(token)
    }
}
