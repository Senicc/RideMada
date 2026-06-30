package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import android.content.Context
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.DriverStatusRequest
import com.ridemada.data.remote.dto.RideDto
import com.ridemada.data.remote.dto.RideRequestDto
import com.ridemada.services.DriverTrackingService
import com.ridemada.services.SocketService
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class DriverDashboardState(
    val isLoading: Boolean = false,
    val isOnline: Boolean = false,
    val isApproved: Boolean = true,
    val todayRevenue: Double = 0.0,
    val todayTrips: Int = 0,
    val totalRevenue: Double = 0.0,
    val completedRides: Int = 0,
    val pendingRides: List<RideDto> = emptyList(),
    val pendingRequests: List<RideRequestDto> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class DriverDashboardViewModel @Inject constructor(
    private val api: RideMadaApi,
    private val socketService: SocketService,
    @ApplicationContext private val context: Context,
) : ViewModel() {

    private val _state = MutableStateFlow(DriverDashboardState())
    val state = _state.asStateFlow()

    init {
        // Listen for new ride requests in real-time via socket
        socketService.setOnNewRideRequest { request ->
            val current = _state.value.pendingRequests
            if (current.none { it.id == request.id }) {
                _state.value = _state.value.copy(pendingRequests = listOf(request) + current)
            }
        }
    }

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            runCatching {
                val statusRes = api.getDriverStatus()
                val earningsRes = api.getDriverEarnings()
                val pendingRes = api.getPendingRideRequests()
                val status = statusRes.body()?.driver
                val earnings = earningsRes.body()
                _state.value = DriverDashboardState(
                    isLoading = false,
                    isOnline = status?.status == "ONLINE",
                    isApproved = status?.isApproved != false,
                    todayRevenue = earnings?.earnings?.totalRevenue ?: 0.0,
                    todayTrips = earnings?.earnings?.todayTrips ?: 0,
                    totalRevenue = earnings?.earnings?.totalRevenue ?: 0.0,
                    completedRides = earnings?.earnings?.completedRides ?: 0,
                    pendingRides = earnings?.pendingRides.orEmpty(),
                    pendingRequests = pendingRes.body()?.rideRequests.orEmpty(),
                )
            }.onFailure { e ->
                _state.value = _state.value.copy(isLoading = false, error = e.message)
            }
        }
    }

    fun setOnline(online: Boolean) {
        viewModelScope.launch {
            val status = if (online) "ONLINE" else "OFFLINE"
            runCatching {
                api.updateDriverStatus(DriverStatusRequest(status))
            }.onSuccess { response ->
                if (response.isSuccessful) {
                    _state.value = _state.value.copy(isOnline = online)
                    if (online) DriverTrackingService.start(context) else DriverTrackingService.stop(context)
                    if (online) load()
                } else {
                    _state.value = _state.value.copy(error = response.message())
                }
            }.onFailure { e ->
                _state.value = _state.value.copy(error = e.message)
            }
        }
    }

    fun acceptRequest(requestId: String) {
        viewModelScope.launch {
            runCatching { api.acceptRideRequest(requestId) }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        // Remove accepted request from pending list immediately (no wait for reload)
                        _state.value = _state.value.copy(
                            pendingRequests = _state.value.pendingRequests.filter { it.id != requestId }
                        )
                        load()
                    } else _state.value = _state.value.copy(error = response.message())
                }
                .onFailure { e ->
                    _state.value = _state.value.copy(error = e.message)
                }
        }
    }
}
