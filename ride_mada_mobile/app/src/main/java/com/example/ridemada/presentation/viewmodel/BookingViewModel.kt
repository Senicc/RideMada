package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.RideDto
import com.ridemada.domain.usecase.CreateBookingUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BookingViewModel @Inject constructor(
    private val createBookingUseCase: CreateBookingUseCase,
    private val api: RideMadaApi,
) : ViewModel() {

    private val _ride = MutableStateFlow<RideDto?>(null)
    val ride = _ride.asStateFlow()

    private val _bookingState = MutableStateFlow<BookingState>(BookingState.Idle)
    val bookingState = _bookingState.asStateFlow()

    fun loadRide(rideId: String) {
        if (rideId.isBlank()) return
        viewModelScope.launch {
            runCatching { api.getRide(rideId) }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        _ride.value = response.body()?.ride
                    }
                }
        }
    }

    fun createBooking(rideId: String, seats: Int) {
        viewModelScope.launch {
            _bookingState.value = BookingState.Loading
            runCatching { createBookingUseCase(rideId, seats) }
                .onSuccess { ok ->
                    _bookingState.value = if (ok) {
                        val driverId = _ride.value?.driver?.user?.id.orEmpty()
                        BookingState.Success(rideId, driverId)
                    } else {
                        BookingState.Error("Réservation refusée")
                    }
                }
                .onFailure { e ->
                    _bookingState.value = BookingState.Error(e.message ?: "Échec de la réservation")
                }
        }
    }

    fun reset() {
        _bookingState.value = BookingState.Idle
    }
}

sealed class BookingState {
    data object Idle : BookingState()
    data object Loading : BookingState()
    data class Success(val rideId: String, val driverUserId: String) : BookingState()
    data class Error(val message: String) : BookingState()
}
