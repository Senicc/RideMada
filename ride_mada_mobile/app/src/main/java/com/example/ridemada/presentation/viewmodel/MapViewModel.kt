package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.android.gms.maps.model.LatLng
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.FareEstimateDto
import com.ridemada.domain.model.DriverLocation
import com.ridemada.domain.usecase.GetNearbyDriversUseCase
import com.ridemada.services.LocationService
import com.ridemada.services.SocketService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MapViewModel @Inject constructor(
    private val getNearbyDriversUseCase: GetNearbyDriversUseCase,
    private val api: RideMadaApi,
    private val socketService: SocketService,
    val locationService: LocationService,
) : ViewModel() {

    private val _fareEstimate = MutableStateFlow<FareEstimateDto?>(null)
    val fareEstimate = _fareEstimate.asStateFlow()

    private val _selectedVehicleType = MutableStateFlow("SEDAN")
    val selectedVehicleType = _selectedVehicleType.asStateFlow()

    private val _isSearchingDriver = MutableStateFlow(false)
    val isSearchingDriver = _isSearchingDriver.asStateFlow()

    private val _nearbyDrivers = MutableStateFlow<List<DriverLocation>>(emptyList())
    val nearbyDrivers = _nearbyDrivers.asStateFlow()

    private val _userLocation = MutableStateFlow<LatLng?>(null)
    val userLocation = _userLocation.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    init {
        socketService.setOnLocationUpdate { json ->
            val lat = json.optDouble("lat", Double.NaN)
            val lng = json.optDouble("lng", Double.NaN)
            if (!lat.isNaN() && !lng.isNaN()) {
                val id = json.optString("driverId", "driver-${lat}-${lng}")
                val updated = _nearbyDrivers.value.toMutableList()
                val idx = updated.indexOfFirst { it.id == id }
                val driver = DriverLocation(
                    id = id,
                    name = json.optString("name", "Conducteur"),
                    lat = lat,
                    lng = lng,
                )
                if (idx >= 0) updated[idx] = driver else updated.add(driver)
                _nearbyDrivers.value = updated
            }
        }
    }

    fun loadNearbyDrivers(lat: Double = -18.8792, lng: Double = 47.5079) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { getNearbyDriversUseCase(lat, lng) }
                .onSuccess { _nearbyDrivers.value = it }
                .onFailure { _error.value = it.message ?: "Impossible de charger les conducteurs" }
            _isLoading.value = false
        }
    }

    fun updateUserLocation(lat: Double, lng: Double) {
        _userLocation.value = LatLng(lat, lng)
        socketService.updateLocation(lat, lng)
    }

    fun selectVehicleType(type: String) {
        _selectedVehicleType.value = type
    }

    fun estimateFare(destinationAddress: String) {
        val origin = _userLocation.value ?: return
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            val dest = geocodeDestination(destinationAddress, origin)
            runCatching {
                api.estimateFare(
                    departureLat = origin.latitude,
                    departureLng = origin.longitude,
                    arrivalLat = dest.latitude,
                    arrivalLng = dest.longitude,
                    vehicleType = _selectedVehicleType.value,
                )
            }.onSuccess { response ->
                _fareEstimate.value = response.body()?.estimate
            }.onFailure { e ->
                _error.value = e.message
            }
            _isLoading.value = false
        }
    }

    fun searchDriver(onMatched: () -> Unit) {
        viewModelScope.launch {
            _isSearchingDriver.value = true
            kotlinx.coroutines.delay(2500)
            _isSearchingDriver.value = false
            onMatched()
        }
    }

    private fun geocodeDestination(address: String, origin: LatLng): LatLng {
        val offsets = mapOf(
            "ivato" to LatLng(-18.7969, 47.4788),
            "analakely" to LatLng(-18.9137, 47.5219),
            "ankorondrano" to LatLng(-18.8762, 47.5258),
            "itasy" to LatLng(-19.0883, 47.2450),
        )
        val key = offsets.keys.find { address.contains(it, ignoreCase = true) }
        return key?.let { offsets[it] }
            ?: LatLng(origin.latitude + 0.02, origin.longitude + 0.02)
    }
}
