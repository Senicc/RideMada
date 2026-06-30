package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.CreateRideRequestBody
import com.ridemada.data.remote.dto.RideRequestDto
import com.ridemada.data.remote.dto.AutocompleteSuggestion
import com.ridemada.domain.model.DriverLocation
import com.ridemada.domain.usecase.GetNearbyDriversUseCase
import com.ridemada.services.LocationService
import com.ridemada.services.SocketService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MapViewModel @Inject constructor(
    private val getNearbyDriversUseCase: GetNearbyDriversUseCase,
    private val api: RideMadaApi,
    private val socketService: SocketService,
    val locationService: LocationService,
) : ViewModel() {

    private val _fareEstimate = MutableStateFlow<com.ridemada.data.remote.dto.FareEstimateDto?>(null)
    val fareEstimate = _fareEstimate.asStateFlow()

    private val _selectedVehicleType = MutableStateFlow("SEDAN")
    val selectedVehicleType = _selectedVehicleType.asStateFlow()

    private val _isSearchingDriver = MutableStateFlow(false)
    val isSearchingDriver = _isSearchingDriver.asStateFlow()

    private val _nearbyDrivers = MutableStateFlow<List<DriverLocation>>(emptyList())
    val nearbyDrivers = _nearbyDrivers.asStateFlow()

    private val _userLocation = MutableStateFlow<com.google.android.gms.maps.model.LatLng?>(null)
    val userLocation = _userLocation.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    private val _activeRideRequest = MutableStateFlow<RideRequestDto?>(null)
    val activeRideRequest = _activeRideRequest.asStateFlow()

    private val _suggestions = MutableStateFlow<List<AutocompleteSuggestion>>(emptyList())
    val suggestions = _suggestions.asStateFlow()

    private val _isSearchingSuggestions = MutableStateFlow(false)
    val isSearchingSuggestions = _isSearchingSuggestions.asStateFlow()

    private val _pickup = MutableStateFlow<com.ridemada.data.remote.dto.AutocompleteSuggestion?>(null)
    val pickup = _pickup.asStateFlow()

    private val _dropoff = MutableStateFlow<com.ridemada.data.remote.dto.AutocompleteSuggestion?>(null)
    val dropoff = _dropoff.asStateFlow()

    private val _route = MutableStateFlow<com.ridemada.data.remote.dto.RouteDto?>(null)
    val route = _route.asStateFlow()

    private var suggestionJob: Job? = null

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
        socketService.setOnRideRequestAccepted { request ->
            _activeRideRequest.value = request
            _isSearchingDriver.value = false
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
        _userLocation.value = com.google.android.gms.maps.model.LatLng(lat, lng)
        socketService.updateLocation(lat, lng, _activeRideRequest.value?.id)
        loadNearbyDrivers(lat, lng)
    }

    fun selectVehicleType(type: String) {
        _selectedVehicleType.value = type
        if (_pickup.value != null && _dropoff.value != null) {
            viewModelScope.launch {
                calculateRouteAndFare()
            }
        } else {
            _fareEstimate.value = null
        }
    }

    fun searchSuggestions(query: String) {
        suggestionJob?.cancel()
        if (query.length < 2) {
            _suggestions.value = emptyList()
            return
        }
        suggestionJob = viewModelScope.launch {
            delay(350)
            _isSearchingSuggestions.value = true
            runCatching { api.autocomplete(query) }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        _suggestions.value = response.body()?.suggestions.orEmpty()
                    }
                }
            _isSearchingSuggestions.value = false
        }
    }

    fun selectSuggestion(suggestion: AutocompleteSuggestion) {
        _suggestions.value = emptyList()
        if (suggestion.lat != null && suggestion.lng != null) {
            _dropoff.value = suggestion
            viewModelScope.launch {
                calculateRouteAndFare()
            }
        }
        _fareEstimate.value = null
    }

    fun clearSuggestions() {
        _suggestions.value = emptyList()
    }

    fun onMapClick(lat: Double, lng: Double) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            // Get address from lat/lng
            val reverseResult = runCatching {
                api.reverseGeocode(lat, lng)
            }.getOrNull()
            val address = reverseResult?.body()?.formattedAddress ?: "$lat, $lng"
            val newSuggestion = com.ridemada.data.remote.dto.AutocompleteSuggestion(
                description = address,
                lat = lat,
                lng = lng,
            )
            // Decide if we're setting pickup or dropoff
            if (_pickup.value == null) {
                _pickup.value = newSuggestion
            } else {
                _dropoff.value = newSuggestion
                // Now calculate route and fare!
                calculateRouteAndFare()
            }
            _isLoading.value = false
        }
    }

    fun setPickupFromUserLocation() {
        val loc = _userLocation.value ?: return
        viewModelScope.launch {
            _isLoading.value = true
            val reverseResult = runCatching {
                api.reverseGeocode(loc.latitude, loc.longitude)
            }.getOrNull()
            val address = reverseResult?.body()?.formattedAddress ?: "Position actuelle"
            _pickup.value = com.ridemada.data.remote.dto.AutocompleteSuggestion(
                description = address,
                lat = loc.latitude,
                lng = loc.longitude,
            )
            // If dropoff is already set, recalculate!
            if (_dropoff.value != null) {
                calculateRouteAndFare()
            }
            _isLoading.value = false
        }
    }

    private suspend fun calculateRouteAndFare() {
        val pickup = _pickup.value ?: _userLocation.value?.let { loc ->
            com.ridemada.data.remote.dto.AutocompleteSuggestion(
                description = "Position actuelle",
                lat = loc.latitude,
                lng = loc.longitude,
            )
        } ?: return
        val dropoff = _dropoff.value ?: return
        if (pickup.lat == null || pickup.lng == null || dropoff.lat == null || dropoff.lng == null) return

        // Get directions
        val directionsResult = runCatching {
            api.getDirections(
                originLat = pickup.lat,
                originLng = pickup.lng,
                destLat = dropoff.lat,
                destLng = dropoff.lng,
            )
        }
        directionsResult.onSuccess { response ->
            if (response.isSuccessful) {
                _route.value = response.body()?.route
                // Use the real distance and duration for fare!
                val fareResult = runCatching {
                    api.estimateFare(
                        departureLat = pickup.lat,
                        departureLng = pickup.lng,
                        arrivalLat = dropoff.lat,
                        arrivalLng = dropoff.lng,
                        vehicleType = _selectedVehicleType.value,
                    )
                }
                fareResult.onSuccess { fareResponse ->
                    if (fareResponse.isSuccessful) {
                        _fareEstimate.value = fareResponse.body()?.estimate
                        _error.value = null
                    } else {
                        _error.value = fareResponse.message() ?: "Erreur estimation prix"
                    }
                }.onFailure { e ->
                    _error.value = e.message ?: "Erreur estimation prix"
                }
            } else {
                _error.value = response.message() ?: "Erreur calcul itinéraire"
            }
        }.onFailure { e ->
            _error.value = e.message ?: "Erreur calcul itinéraire"
        }
    }

    fun estimateFare(destinationAddress: String) {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null

            // If pickup not already set, use user location
            if (_pickup.value == null) {
                val loc = _userLocation.value ?: run {
                    _isLoading.value = false
                    _error.value = "Position introuvable"
                    return@launch
                }
                _pickup.value = com.ridemada.data.remote.dto.AutocompleteSuggestion(
                    description = "Position actuelle",
                    lat = loc.latitude,
                    lng = loc.longitude,
                )
            }

            val dest = geocodeDestination(destinationAddress,
                _pickup.value?.lat?.let { lat ->
                    _pickup.value?.lng?.let { lng ->
                        com.google.android.gms.maps.model.LatLng(lat, lng)
                    }
                } ?: _userLocation.value ?: run {
                    _isLoading.value = false
                    _error.value = "Position introuvable"
                    return@launch
                })
            _dropoff.value = com.ridemada.data.remote.dto.AutocompleteSuggestion(
                description = destinationAddress,
                lat = dest.latitude,
                lng = dest.longitude,
            )
            calculateRouteAndFare()
            _isLoading.value = false
        }
    }

    fun requestRide(onSuccess: (RideRequestDto) -> Unit) {
        val pickup = _pickup.value ?: _userLocation.value?.let { loc ->
            com.ridemada.data.remote.dto.AutocompleteSuggestion(
                description = "Position actuelle",
                lat = loc.latitude,
                lng = loc.longitude,
            )
        } ?: return
        val dropoff = _dropoff.value ?: return
        if (pickup.lat == null || pickup.lng == null || dropoff.lat == null || dropoff.lng == null) return

        viewModelScope.launch {
            _isSearchingDriver.value = true
            _error.value = null
            runCatching {
                api.createRideRequest(
                    CreateRideRequestBody(
                        pickupLat = pickup.lat,
                        pickupLng = pickup.lng,
                        pickupAddress = pickup.description,
                        dropoffLat = dropoff.lat,
                        dropoffLng = dropoff.lng,
                        dropoffAddress = dropoff.description,
                        vehicleType = _selectedVehicleType.value,
                    ),
                )
            }.onSuccess { response ->
                val body = response.body()
                if (response.isSuccessful && body?.rideRequest != null) {
                    _activeRideRequest.value = body.rideRequest
                    socketService.joinRideRequestRoom(body.rideRequest.id)
                    onSuccess(body.rideRequest)
                } else {
                    _error.value = body?.message ?: "Impossible de commander la course"
                    _isSearchingDriver.value = false
                }
            }.onFailure { e ->
                _error.value = e.message
                _isSearchingDriver.value = false
            }
        }
    }

    private suspend fun geocodeDestination(address: String, origin: com.google.android.gms.maps.model.LatLng): com.google.android.gms.maps.model.LatLng {
        runCatching { api.geocode(address) }.onSuccess { response ->
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.lat != null && body.lng != null) {
                    return com.google.android.gms.maps.model.LatLng(body.lat, body.lng)
                }
            }
        }
        val offsets = mapOf(
            "ivato" to com.google.android.gms.maps.model.LatLng(-18.7969, 47.4788),
            "analakely" to com.google.android.gms.maps.model.LatLng(-18.9137, 47.5219),
            "ankorondrano" to com.google.android.gms.maps.model.LatLng(-18.8762, 47.5258),
            "itasy" to com.google.android.gms.maps.model.LatLng(-19.0883, 47.2450),
        )
        val key = offsets.keys.find { address.contains(it, ignoreCase = true) }
        return key?.let { offsets[it] }
            ?: com.google.android.gms.maps.model.LatLng(origin.latitude + 0.02, origin.longitude + 0.02)
    }
}
