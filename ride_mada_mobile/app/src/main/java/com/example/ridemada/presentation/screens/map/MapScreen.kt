package com.ridemada.presentation.screens.map

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*
import com.ridemada.presentation.viewmodel.MapViewModel
import com.ridemada.services.LocationService
import kotlinx.coroutines.flow.collectLatest

@Composable
fun MapScreen(
    viewModel: MapViewModel = hiltViewModel(),
    locationService: LocationService = hiltViewModel() // Injection possible
) {
    val context = LocalContext.current
    val cameraPositionState = rememberCameraPositionState()
    val nearbyDrivers by viewModel.nearbyDrivers.collectAsState()
    val userLocation by viewModel.userLocation.collectAsState()

    // Mise à jour automatique de la position
    LaunchedEffect(Unit) {
        locationService.getLocationUpdates().collectLatest { location ->
            viewModel.updateUserLocation(location.latitude, location.longitude)
        }
    }

    GoogleMap(
        modifier = Modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState,
        properties = MapProperties(isMyLocationEnabled = true),
        uiSettings = MapUiSettings(
            zoomControlsEnabled = true,
            myLocationButtonEnabled = true
        )
    ) {
        // Conducteurs en temps réel
        nearbyDrivers.forEach { driver ->
            Marker(
                state = MarkerState(LatLng(driver.lat, driver.lng)),
                title = driver.name,
                snippet = "${driver.distance} km • ${driver.rating} ★",
                icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN)
            )
        }

        // Ma position
        userLocation?.let {
            Marker(
                state = MarkerState(it),
                title = "Vous êtes ici",
                icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_BLUE)
            )
        }
    }

    // Boutons flottants
    Box(modifier = Modifier.fillMaxSize()) {
        FloatingActionButton(
            onClick = { viewModel.loadNearbyDrivers() },
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(16.dp)
        ) {
            Icon(Icons.Default.Refresh, "Actualiser")
        }
    }
}