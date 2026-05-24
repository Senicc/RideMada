package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.UserDto
import com.ridemada.domain.repository.AuthRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    private val api: RideMadaApi,
) : ViewModel() {

    private val _user = MutableStateFlow<UserDto?>(null)
    val user = _user.asStateFlow()

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _user.value = authRepository.getCurrentUser()
            runCatching { api.getProfile() }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        _user.value = response.body()?.user ?: _user.value
                    }
                }
        }
    }

    fun logout(onDone: () -> Unit) {
        viewModelScope.launch {
            authRepository.clearSession()
            onDone()
        }
    }
}
