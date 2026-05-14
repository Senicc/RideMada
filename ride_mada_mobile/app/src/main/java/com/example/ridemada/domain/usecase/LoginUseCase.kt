package com.ridemada.domain.usecase

import com.ridemada.domain.repository.AuthRepository
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(phone: String, password: String) =
        authRepository.login(phone, password)
}