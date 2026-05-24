package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.DriverStatusRequest
import com.ridemada.data.remote.dto.RideDto
import dagger.hilt.android.lifecycle.HiltViewModel
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
    val error: String? = null,
)

@HiltViewModel
class DriverDashboardViewModel @Inject constructor(
    private val api: RideMadaApi,
) : ViewModel() {

    private val _state = MutableStateFlow(DriverDashboardState())
    val state = _state.asStateFlow()

    fun load() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            runCatching {
                val statusRes = api.getDriverStatus()
                val earningsRes = api.getDriverEarnings()
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
                } else {
                    _state.value = _state.value.copy(error = response.message())
                }
            }.onFailure { e ->
                _state.value = _state.value.copy(error = e.message)
            }
        }
    }
}
