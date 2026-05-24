package com.ridemada.presentation.screens.map

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
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
    val bottomSheetState = rememberStandardBottomSheetState(initialValue = SheetValue.PartiallyExpanded)
    val scaffoldState = rememberBottomSheetScaffoldState(bottomSheetState = bottomSheetState)

    BottomSheetScaffold(
        scaffoldState = scaffoldState,
        sheetPeekHeight = 280.dp,
        sheetShape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
        sheetContainerColor = MaterialTheme.colorScheme.inverseSurface,
        sheetContentColor = MaterialTheme.colorScheme.inverseOnSurface,
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
                    color = MaterialTheme.colorScheme.inverseOnSurface,
                )
                Spacer(modifier = Modifier.height(12.dp))
                RideMadaTextField(
                    value = destination,
                    onValueChange = { destination = it },
                    label = "Où allez-vous ?",
                    icon = Icons.Default.Search,
                )
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
                            viewModel.searchDriver {
                                navController.navigate(
                                    Screen.TripTracking.createRoute(destination, fareEstimate!!.price),
                                )
                            }
                        }
                    },
                    enabled = destination.isNotBlank() && !isLoading && !isSearching,
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
            ) {
                nearbyDrivers.forEach { driver ->
                    Marker(
                        state = MarkerState(LatLng(driver.lat, driver.lng)),
                        title = driver.name,
                        icon = BitmapDescriptorFactory.defaultMarker(BitmapDescriptorFactory.HUE_GREEN),
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
