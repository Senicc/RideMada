package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.domain.usecase.CreateBookingUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BookingViewModel @Inject constructor(
    private val createBookingUseCase: CreateBookingUseCase
) : ViewModel() {

    private val _bookingState = MutableStateFlow<BookingState>(BookingState.Idle)
    val bookingState = _bookingState.asStateFlow()

    fun createBooking(rideId: String, seats: Int) {
        viewModelScope.launch {
            _bookingState.value = BookingState.Loading
            try {
                val result = createBookingUseCase(rideId, seats)
                _bookingState.value = BookingState.Success(result)
            } catch (e: Exception) {
                _bookingState.value = BookingState.Error(e.message ?: "Échec de la réservation")
            }
        }
    }
}

sealed class BookingState {
    data object Idle : BookingState()
    data object Loading : BookingState()
    data class Success(val bookingId: String) : BookingState()
    data class Error(val message: String) : BookingState()
}