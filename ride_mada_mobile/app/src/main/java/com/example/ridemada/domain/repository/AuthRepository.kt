package com.ridemada.domain.repository

import com.ridemada.data.remote.dto.AuthResponse
import com.ridemada.data.remote.dto.UserDto

interface AuthRepository {
    suspend fun login(phone: String, password: String): AuthResponse
    suspend fun register(name: String, phone: String, password: String): AuthResponse
    suspend fun verifyOtp(phone: String, otp: String): AuthResponse
    suspend fun forgotPassword(phone: String): AuthResponse
    suspend fun resetPassword(phone: String, otp: String, newPassword: String): AuthResponse
    suspend fun updateFcmToken(token: String)
    suspend fun saveSession(accessToken: String, refreshToken: String, user: UserDto)
    suspend fun clearSession()
    suspend fun getAccessToken(): String?
    suspend fun getCurrentUser(): UserDto?
    suspend fun isLoggedIn(): Boolean

    suspend fun restoreSession()
}
