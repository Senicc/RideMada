package com.ridemada.data.remote.dto

data class AuthResponse(
    val success: Boolean,
    val message: String?,
    val accessToken: String?,
    val refreshToken: String?,
    val user: UserDto?
)

data class LoginRequest(
    val phone: String,
    val password: String
)

data class RegisterRequest(
    val name: String,
    val phone: String,
    val password: String,
    val role: String = "PASSENGER"
)