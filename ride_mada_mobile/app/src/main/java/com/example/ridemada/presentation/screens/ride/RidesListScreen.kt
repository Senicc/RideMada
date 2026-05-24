package com.ridemada.presentation.screens.ride

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.domain.model.Ride
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.RideViewModel

@Composable
fun RidesListScreen(
    navController: NavHostController,
    viewModel: RideViewModel = hiltViewModel(),
) {
    val rides by viewModel.rides.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    LaunchedEffect(Unit) { viewModel.loadNearbyRides() }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Trajets disponibles", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        if (isLoading) {
            CircularProgressIndicator()
        } else if (rides.isEmpty()) {
            Text("Aucun trajet pour le moment.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(rides, key = { it.id }) { ride ->
                    RideCard(ride = ride, onBook = {
                        navController.navigate(Screen.Booking.createRoute(ride.id))
                    })
                }
            }
        }
    }
}

@Composable
private fun RideCard(ride: Ride, onBook: () -> Unit) {
    Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(ride.departureAddress, style = MaterialTheme.typography.titleMedium)
            Text("→ ${ride.arrivalAddress}", style = MaterialTheme.typography.bodyMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text("${ride.price} Ar • ${ride.availableSeats} places", style = MaterialTheme.typography.labelLarge)
            Spacer(modifier = Modifier.height(12.dp))
            Button(onClick = onBook, modifier = Modifier.fillMaxWidth()) {
                Text("Réserver")
            }
        }
    }
}
