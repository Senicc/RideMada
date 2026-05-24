package com.ridemada.domain.usecase

import com.ridemada.data.remote.dto.AuthResponse
import com.ridemada.domain.repository.AuthRepository
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository,
) {
    suspend operator fun invoke(phone: String, password: String): AuthResponse =
        authRepository.login(phone, password)
}
