package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.domain.model.DriverLocation
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MapViewModel @Inject constructor(
    private val getNearbyDriversUseCase: GetNearbyDriversUseCase,
    private val socketService: SocketService,
    private val locationService: LocationService
) : ViewModel() {

    private val _nearbyDrivers = MutableStateFlow<List<DriverLocation>>(emptyList())
    val nearbyDrivers = _nearbyDrivers.asStateFlow()

    private val _userLocation = MutableStateFlow<LatLng?>(null)
    val userLocation = _userLocation.asStateFlow()

    init {
        // Écoute des mises à jour temps réel
        socketService.setOnLocationUpdate { json ->
            // Parser et mettre à jour les drivers
        }
    }

    fun loadNearbyDrivers() {
        viewModelScope.launch {
            try {
                val drivers = getNearbyDriversUseCase(-18.8792, 47.5079)
                _nearbyDrivers.value = drivers
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    fun updateUserLocation(lat: Double, lng: Double) {
        _userLocation.value = LatLng(lat, lng)
        socketService.updateLocation(lat, lng)   // Envoi temps réel au backend
    }
}