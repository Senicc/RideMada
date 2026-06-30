package com.ridemada.presentation.screens.driver

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.DirectionsCar
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavHostController
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.RideDto
import com.ridemada.data.remote.dto.RideRequestDto
import com.ridemada.presentation.navigation.Screen
import com.ridemada.ui.theme.GreenAccent
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DriverRidesViewModel @Inject constructor(private val api: RideMadaApi) : ViewModel() {
    private val _activeRide = MutableStateFlow<RideRequestDto?>(null)
    val activeRide = _activeRide.asStateFlow()
    private val _history = MutableStateFlow<List<RideRequestDto>>(emptyList())
    val history = _history.asStateFlow()
    private val _sharedRides = MutableStateFlow<List<RideDto>>(emptyList())
    val sharedRides = _sharedRides.asStateFlow()
    private val _loading = MutableStateFlow(true)
    val loading = _loading.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _loading.value = true
            runCatching {
                val active = api.getDriverActiveRide()
                val historyRes = api.getDriverRideHistory()
                if (active.isSuccessful) _activeRide.value = active.body()?.rideRequest
                if (historyRes.isSuccessful) {
                    _history.value = historyRes.body()?.rideRequests.orEmpty()
                    _sharedRides.value = historyRes.body()?.sharedRides.orEmpty()
                }
            }
            _loading.value = false
        }
    }

    fun markArriving(id: String) = updateRide(id) { api.driverArriving(id) }
    fun startRide(id: String) = updateRide(id) { api.startRideRequest(id) }
    fun completeRide(id: String) = updateRide(id) { api.completeRideRequest(id) }

    private fun updateRide(id: String, call: suspend () -> retrofit2.Response<*>) {
        viewModelScope.launch {
            runCatching { call() }.onSuccess { if (it.isSuccessful) load() }
        }
    }
}

@Composable
fun DriverRidesScreen(
    navController: NavHostController,
    viewModel: DriverRidesViewModel = hiltViewModel(),
) {
    val active by viewModel.activeRide.collectAsState()
    val history by viewModel.history.collectAsState()
    val shared by viewModel.sharedRides.collectAsState()
    val loading by viewModel.loading.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surface)
                .padding(top = 40.dp, bottom = 16.dp, start = 24.dp, end = 24.dp),
        ) {
            Text("Mes courses", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
        }

        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            return
        }

        LazyColumn(modifier = Modifier.fillMaxSize(), contentPadding = PaddingValues(24.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            active?.let { ride ->
                item {
                    Text("Course active", fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))
                    Card(shape = RoundedCornerShape(12.dp), colors = CardDefaults.cardColors(containerColor = GreenAccent.copy(alpha = 0.12f))) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(ride.pickupAddress, fontWeight = FontWeight.Bold)
                            Text("→ ${ride.dropoffAddress}", style = MaterialTheme.typography.bodySmall)
                            Text("Passager : ${ride.passenger?.name ?: "—"}")
                            Text("Statut : ${ride.status}")
                            Spacer(modifier = Modifier.height(12.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                when (ride.status) {
                                    "ACCEPTED" -> Button(onClick = { viewModel.markArriving(ride.id) }) { Text("J'arrive") }
                                    "DRIVER_ARRIVING" -> Button(onClick = { viewModel.startRide(ride.id) }) { Text("Démarrer") }
                                    "IN_PROGRESS" -> Button(onClick = { viewModel.completeRide(ride.id) }) { Text("Terminer") }
                                }
                                OutlinedButton(onClick = {
                                    ride.passenger?.id?.let { pid ->
                                        navController.navigate(Screen.Chat.createRoute(pid, ride.id))
                                    }
                                }) { Text("Chat") }
                            }
                        }
                    }
                }
            }

            if (history.isNotEmpty()) {
                item { Text("Historique à la demande", fontWeight = FontWeight.Bold) }
                items(history) { ride ->
                    Card(shape = RoundedCornerShape(12.dp)) {
                        Row(modifier = Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.DirectionsCar, contentDescription = null, tint = GreenAccent)
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(ride.pickupAddress, maxLines = 1, fontWeight = FontWeight.SemiBold)
                                Text("${ride.status} • ${ride.estimatedPrice.toInt()} Ar", style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                }
            }

            if (shared.isNotEmpty()) {
                item { Text("Trajets partagés", fontWeight = FontWeight.Bold) }
                items(shared) { ride ->
                    Card(shape = RoundedCornerShape(12.dp)) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text("${ride.departureAddress} → ${ride.arrivalAddress}", fontWeight = FontWeight.SemiBold)
                            Text("${ride.status} • ${ride.price.toInt()} Ar", style = MaterialTheme.typography.bodySmall)
                        }
                    }
                }
            }

            if (active == null && history.isEmpty() && shared.isEmpty()) {
                item {
                    Box(Modifier.fillMaxWidth().height(200.dp), contentAlignment = Alignment.Center) {
                        Text("Aucune course pour le moment", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}
