package com.ridemada.presentation.screens.map

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.*
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.components.RideMadaTextField
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.MapViewModel
import com.ridemada.ui.theme.BrandAccent
import kotlinx.coroutines.flow.collectLatest

private val vehicleTypes = listOf(
    "SEDAN" to "Standard",
    "SUV" to "Confort",
    "MOTORCYCLE" to "Moto",
    "MINIBUS" to "Van",
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MapScreen(
    navController: NavHostController,
    viewModel: MapViewModel = hiltViewModel(),
) {
    val context = LocalContext.current
    val nearbyDrivers by viewModel.nearbyDrivers.collectAsState()
    val userLocation by viewModel.userLocation.collectAsState()
    val fareEstimate by viewModel.fareEstimate.collectAsState()
    val selectedType by viewModel.selectedVehicleType.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val isSearching by viewModel.isSearchingDriver.collectAsState()
    val error by viewModel.error.collectAsState()

    val pickup by viewModel.pickup.collectAsState()
    val dropoff by viewModel.dropoff.collectAsState()
    val route by viewModel.route.collectAsState()

    var hasLocationPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) ==
                PackageManager.PERMISSION_GRANTED,
        )
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) { result ->
        hasLocationPermission = result[Manifest.permission.ACCESS_FINE_LOCATION] == true ||
            result[Manifest.permission.ACCESS_COARSE_LOCATION] == true
    }

    val defaultLatLng = LatLng(-18.8792, 47.5079)
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(defaultLatLng, 13f)
    }

    LaunchedEffect(Unit) {
        if (!hasLocationPermission) {
            permissionLauncher.launch(
                arrayOf(
                    Manifest.permission.ACCESS_FINE_LOCATION,
                    Manifest.permission.ACCESS_COARSE_LOCATION,
                ),
            )
        }
        viewModel.loadNearbyDrivers()
    }

    LaunchedEffect(hasLocationPermission) {
        if (!hasLocationPermission) return@LaunchedEffect
        viewModel.locationService.getLocationUpdates().collectLatest { location ->
            viewModel.updateUserLocation(location.latitude, location.longitude)
            cameraPositionState.position = CameraPosition.fromLatLngZoom(
                LatLng(location.latitude, location.longitude),
                15f,
            )
        }
    }

    var destination by remember { mutableStateOf("") }
    val suggestions by viewModel.suggestions.collectAsState()
    val isSearchingSuggestions by viewModel.isSearchingSuggestions.collectAsState()

    LaunchedEffect(destination) {
        viewModel.searchSuggestions(destination)
    }
    val bottomSheetState = rememberStandardBottomSheetState(initialValue = SheetValue.PartiallyExpanded)
    val scaffoldState = rememberBottomSheetScaffoldState(bottomSheetState = bottomSheetState)

    BottomSheetScaffold(
        scaffoldState = scaffoldState,
        sheetPeekHeight = 280.dp,
        sheetShape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        sheetContainerColor = MaterialTheme.colorScheme.surface,
        sheetContentColor = MaterialTheme.colorScheme.onSurface,
        sheetContent = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
            ) {
                Box(
                    modifier = Modifier
                        .width(40.dp)
                        .height(4.dp)
                        .align(Alignment.CenterHorizontally)
                        .background(
                            MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f),
                            RoundedCornerShape(2.dp),
                        ),
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = "Commander une course",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                )
                Spacer(modifier = Modifier.height(12.dp))
                RideMadaTextField(
                    value = pickup?.description ?: "",
                    onValueChange = { }, // Don't let user edit directly; they use map or "Ma position" button
                    label = "Départ",
                    icon = Icons.Default.LocationOn,
                    trailingIcon = {
                        IconButton(onClick = { viewModel.setPickupFromUserLocation() }) {
                            Icon(Icons.Default.MyLocation, contentDescription = "Ma position")
                        }
                    },
                )
                Spacer(modifier = Modifier.height(8.dp))
                RideMadaTextField(
                    value = dropoff?.description ?: destination,
                    onValueChange = {
                        destination = it
                    },
                    label = "Où allez-vous ?",
                    icon = Icons.Default.Search,
                )
                if (suggestions.isNotEmpty()) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp),
                    ) {
                        Column(modifier = Modifier.padding(vertical = 4.dp)) {
                            suggestions.take(5).forEach { suggestion ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clickable {
                                            destination = suggestion.description
                                            viewModel.selectSuggestion(suggestion)
                                            viewModel.clearSuggestions()
                                        }
                                        .padding(horizontal = 16.dp, vertical = 12.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                ) {
                                    Icon(
                                        Icons.Default.Place,
                                        contentDescription = null,
                                        tint = BrandAccent,
                                        modifier = Modifier.size(20.dp),
                                    )
                                    Spacer(modifier = Modifier.width(12.dp))
                                    Text(
                                        suggestion.description,
                                        style = MaterialTheme.typography.bodyMedium,
                                    )
                                }
                            }
                        }
                    }
                } else if (isSearchingSuggestions && destination.length >= 2) {
                    LinearProgressIndicator(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 4.dp),
                    )
                }
                Spacer(modifier = Modifier.height(12.dp))
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    vehicleTypes.forEach { (type, label) ->
                        FilterChip(
                            selected = selectedType == type,
                            onClick = { viewModel.selectVehicleType(type) },
                            label = { Text(label) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = BrandAccent,
                                selectedLabelColor = Color.White,
                            ),
                        )
                    }
                }
                fareEstimate?.let { estimate ->
                    Spacer(modifier = Modifier.height(12.dp))
                    Card(
                        colors = CardDefaults.cardColors(containerColor = BrandAccent.copy(alpha = 0.12f)),
                        shape = RoundedCornerShape(12.dp),
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text("${estimate.distanceKm} km • ~${estimate.durationMin} min")
                            Text(
                                "${estimate.price} ${estimate.currency}",
                                fontWeight = FontWeight.Bold,
                                color = BrandAccent,
                            )
                        }
                    }
                }
                if (error != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(error!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                }
                Spacer(modifier = Modifier.height(12.dp))
                RideMadaButton(
                    text = when {
                        isSearching -> "Recherche en cours..."
                        fareEstimate != null -> "Commander • ${fareEstimate!!.price} Ar"
                        else -> "Estimer le prix"
                    },
                    onClick = {
                        if (fareEstimate == null) {
                            viewModel.estimateFare(destination)
                        } else {
                            viewModel.requestRide { request ->
                                navController.navigate(
                                    Screen.TripTracking.createRoute(
                                        request.id,
                                        request.dropoffAddress,
                                        request.estimatedPrice.toInt(),
                                    ),
                                )
                            }
                        }
                    },
                    enabled = (pickup != null || destination.isNotBlank()) && (dropoff != null || destination.isNotBlank()) && !isLoading && !isSearching,
                    isLoading = isLoading || isSearching,
                )
                Spacer(modifier = Modifier.height(80.dp))
            }
        },
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize()) {
            GoogleMap(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                cameraPositionState = cameraPositionState,
                properties = MapProperties(isMyLocationEnabled = hasLocationPermission),
                uiSettings = MapUiSettings(
                    zoomControlsEnabled = false,
                    myLocationButtonEnabled = false,
                    compassEnabled = false,
                ),
                onMapClick = { latLng ->
                    viewModel.onMapClick(latLng.latitude, latLng.longitude)
                },
            ) {
                nearbyDrivers.forEach { driver ->
                    Marker(
                        state = MarkerState(LatLng(driver.lat, driver.lng)),
                        title = driver.name,
                        icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN),
                    )
                }

                // Pickup marker
                pickup?.let { p ->
                    if (p.lat != null && p.lng != null) {
                        Marker(
                            state = MarkerState(LatLng(p.lat, p.lng)),
                            title = p.description,
                            icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_AZURE),
                        )
                    }
                }

                // Dropoff marker
                dropoff?.let { d ->
                    if (d.lat != null && d.lng != null) {
                        Marker(
                            state = MarkerState(LatLng(d.lat, d.lng)),
                            title = d.description,
                            icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_ROSE),
                        )
                    }
                }

                // Route polyline (décodée)
                val polylineString = route?.polyline
                val coords = route?.geometry?.coordinates
                
                if (!polylineString.isNullOrEmpty()) {
                    val decodedPoints = decodePolyline(polylineString)
                    Polyline(
                        points = decodedPoints,
                        color = BrandAccent,
                        width = 8f,
                    )
                } else if (coords != null) {
                    val points = coords.map { LatLng(it[1], it[0]) }
                    Polyline(
                        points = points,
                        color = BrandAccent,
                        width = 8f,
                    )
                }
            }
            FloatingActionButton(
                onClick = {
                    userLocation?.let {
                        cameraPositionState.position = CameraPosition.fromLatLngZoom(it, 15f)
                    }
                },
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 16.dp, end = 16.dp),
                containerColor = MaterialTheme.colorScheme.surface,
            ) {
                Icon(Icons.Default.MyLocation, contentDescription = "Ma position")
            }
        }
    }
}

private fun decodePolyline(encoded: String): List<LatLng> {
    val poly = ArrayList<LatLng>()
    var index = 0
    val len = encoded.length
    var lat = 0
    var lng = 0
    while (index < len) {
        var b: Int
        var shift = 0
        var result = 0
        do {
            b = encoded[index++].code - 63
            result = result or (b and 0x1f shl shift)
            shift += 5
        } while (b >= 0x20)
        val dlat = if (result and 1 != 0) (result shr 1).inv() else result shr 1
        lat += dlat
        shift = 0
        result = 0
        do {
            b = encoded[index++].code - 63
            result = result or (b and 0x1f shl shift)
            shift += 5
        } while (b >= 0x20)
        val dlng = if (result and 1 != 0) (result shr 1).inv() else result shr 1
        lng += dlng
        poly.add(LatLng(lat.toDouble() / 1E5, lng.toDouble() / 1E5))
    }
    return poly
}
