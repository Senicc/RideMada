package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.domain.usecase.BecomeDriverUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DriverViewModel @Inject constructor(
    private val becomeDriverUseCase: BecomeDriverUseCase
) : ViewModel() {

    private val _driverState = MutableStateFlow<DriverState>(DriverState.Idle)
    val driverState = _driverState.asStateFlow()

    fun becomeDriver(brand: String, model: String, plate: String, seats: Int) {
        viewModelScope.launch {
            _driverState.value = DriverState.Loading
            try {
                val result = becomeDriverUseCase(brand, model, plate, seats)
                _driverState.value = DriverState.Success(result)
            } catch (e: Exception) {
                _driverState.value = DriverState.Error(e.message ?: "Erreur inconnue")
            }
        }
    }
}

sealed class DriverState {
    data object Idle : DriverState()
    data object Loading : DriverState()
    data class Success(val message: String) : DriverState()
    data class Error(val message: String) : DriverState()
}