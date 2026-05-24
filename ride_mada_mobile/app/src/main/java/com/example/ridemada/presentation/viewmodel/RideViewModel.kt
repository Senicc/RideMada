package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.CreateRideRequest
import com.ridemada.data.remote.dto.VehicleDto
import com.ridemada.domain.model.Ride
import com.ridemada.domain.repository.MapRepository
import com.ridemada.domain.usecase.CreateRideUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.Instant
import javax.inject.Inject

@HiltViewModel
class RideViewModel @Inject constructor(
    private val mapRepository: MapRepository,
    private val createRideUseCase: CreateRideUseCase,
    private val api: RideMadaApi,
) : ViewModel() {

    private val _rides = MutableStateFlow<List<Ride>>(emptyList())
    val rides = _rides.asStateFlow()

    private val _vehicles = MutableStateFlow<List<VehicleDto>>(emptyList())
    val vehicles = _vehicles.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _createState = MutableStateFlow<String?>(null)
    val createState = _createState.asStateFlow()

    init {
        loadVehicles()
    }

    fun loadVehicles() {
        viewModelScope.launch {
            runCatching { api.getMyVehicles() }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        _vehicles.value = response.body()?.vehicles ?: emptyList()
                    }
                }
        }
    }

    fun loadNearbyRides(lat: Double = -18.8792, lng: Double = 47.5079) {
        viewModelScope.launch {
            _isLoading.value = true
            runCatching { mapRepository.getNearbyRides(lat, lng) }
                .onSuccess { _rides.value = it }
            _isLoading.value = false
        }
    }

    fun clearCreateState() {
        _createState.value = null
    }

    fun createRide(
        departureAddress: String,
        arrivalAddress: String,
        price: Double,
        seats: Int,
        vehicleId: String,
    ) {
        if (vehicleId.isBlank()) {
            _createState.value = "Sélectionnez un véhicule"
            return
        }
        viewModelScope.launch {
            val request = CreateRideRequest(
                departureLat = -18.8792,
                departureLng = 47.5079,
                arrivalLat = -18.91,
                arrivalLng = 47.52,
                departureAddress = departureAddress,
                arrivalAddress = arrivalAddress,
                departureTime = Instant.now().plusSeconds(3600).toString(),
                price = price,
                availableSeats = seats,
                vehicleId = vehicleId,
            )
            runCatching { createRideUseCase(request) }
                .onSuccess { ok ->
                    _createState.value = if (ok) "Trajet publié" else "Échec publication"
                }
                .onFailure { _createState.value = it.message }
        }
    }
}
