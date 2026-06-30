package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.RideRequestDto
import com.ridemada.services.SocketService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class TripPhase { SEARCHING, DRIVER_ASSIGNED, EN_ROUTE, ARRIVED, COMPLETED }

@HiltViewModel
class TripViewModel @Inject constructor(
    private val api: RideMadaApi,
    private val socketService: SocketService,
) : ViewModel() {

    private val _phase = MutableStateFlow(TripPhase.SEARCHING)
    val phase = _phase.asStateFlow()

    private val _rideRequest = MutableStateFlow<RideRequestDto?>(null)
    val rideRequest = _rideRequest.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    fun observeRide(rideRequestId: String) {
        socketService.joinRideRequestRoom(rideRequestId)
        socketService.setOnRideRequestStatusUpdate { json ->
            val status = json.optString("status")
            _phase.value = when (status) {
                "ACCEPTED" -> TripPhase.DRIVER_ASSIGNED
                "DRIVER_ARRIVING" -> TripPhase.EN_ROUTE
                "IN_PROGRESS" -> TripPhase.EN_ROUTE
                "COMPLETED" -> TripPhase.ARRIVED
                else -> _phase.value
            }
        }

        viewModelScope.launch {
            while (_phase.value !in listOf(TripPhase.ARRIVED, TripPhase.COMPLETED)) {
                runCatching { api.getRideRequest(rideRequestId) }
                    .onSuccess { response ->
                        val request = response.body()?.rideRequest
                        if (request != null) {
                            _rideRequest.value = request
                            _phase.value = when (request.status) {
                                "REQUESTED" -> TripPhase.SEARCHING
                                "ACCEPTED" -> TripPhase.DRIVER_ASSIGNED
                                "DRIVER_ARRIVING", "IN_PROGRESS" -> TripPhase.EN_ROUTE
                                "COMPLETED" -> TripPhase.ARRIVED
                                else -> _phase.value
                            }
                        }
                    }
                delay(3000)
            }
        }
    }

    fun cancelRide(rideRequestId: String, onCancelled: () -> Unit) {
        viewModelScope.launch {
            runCatching { api.cancelRideRequest(rideRequestId) }
                .onSuccess { if (it.isSuccessful) onCancelled() }
                .onFailure { _error.value = it.message }
        }
    }
}
