package com.ridemada.presentation.screens.booking

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.BookingState
import com.ridemada.presentation.viewmodel.BookingViewModel

@Composable
fun BookingScreen(
    rideId: String,
    navController: NavHostController,
    viewModel: BookingViewModel = hiltViewModel(),
) {
    var selectedSeats by remember { mutableStateOf(1) }
    val state by viewModel.bookingState.collectAsState()
    val ride by viewModel.ride.collectAsState()

    LaunchedEffect(rideId) {
        viewModel.loadRide(rideId)
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Confirmer la réservation", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(24.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant),
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(ride?.departureAddress ?: "Chargement...", style = MaterialTheme.typography.titleMedium)
                Text("→ ${ride?.arrivalAddress.orEmpty()}", style = MaterialTheme.typography.bodyMedium)
                Text("${ride?.price ?: 0} Ar", style = MaterialTheme.typography.labelLarge)
                Spacer(modifier = Modifier.height(12.dp))
                Text("Nombre de places")
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    (1..4).forEach { num ->
                        FilterChip(
                            selected = selectedSeats == num,
                            onClick = { selectedSeats = num },
                            label = { Text("$num") },
                        )
                    }
                }
            }
        }

        if (state is BookingState.Error) {
            Text(
                (state as BookingState.Error).message,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(top = 8.dp),
            )
        }
        if (state is BookingState.Success) {
            val success = state as BookingState.Success
            Column(modifier = Modifier.padding(top = 8.dp)) {
                Text("Réservation confirmée !", color = MaterialTheme.colorScheme.primary)
                if (success.driverUserId.isNotBlank()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = {
                            navController.navigate(
                                Screen.Chat.createRoute(success.driverUserId, success.rideId),
                            )
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Icon(Icons.Default.Chat, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Contacter le conducteur")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.weight(1f))
        Button(
            onClick = { viewModel.createBooking(rideId, selectedSeats) },
            modifier = Modifier.fillMaxWidth(),
            enabled = state !is BookingState.Loading && rideId.isNotBlank() && state !is BookingState.Success,
        ) {
            Text(if (state is BookingState.Loading) "..." else "Réserver maintenant")
        }
    }
}
