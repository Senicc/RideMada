package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.domain.usecase.CreateRideUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RideViewModel @Inject constructor(
    private val createRideUseCase: CreateRideUseCase
) : ViewModel() {

    private val _rideState = MutableStateFlow<RideState>(RideState.Idle)
    val rideState = _rideState.asStateFlow()

    fun createRide(
        departureAddress: String,
        arrivalAddress: String,
        price: Double,
        seats: Int
    ) {
        viewModelScope.launch {
            _rideState.value = RideState.Loading
            try {
                val result = createRideUseCase(departureAddress, arrivalAddress, price, seats)
                _rideState.value = RideState.Success(result)
            } catch (e: Exception) {
                _rideState.value = RideState.Error(e.message ?: "Erreur lors de la création")
            }
        }
    }
}

sealed class RideState {
    data object Idle : RideState()
    data object Loading : RideState()
    data class Success(val rideId: String) : RideState()
    data class Error(val message: String) : RideState()
    
}