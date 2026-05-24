package com.ridemada.presentation.screens.booking

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Chat
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.data.remote.dto.BookingDto
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.BookingsViewModel

@Composable
fun BookingsListScreen(
    navController: NavHostController,
    viewModel: BookingsViewModel = hiltViewModel(),
) {
    val bookings by viewModel.bookings.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Mes réservations", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        error?.let { Text(it, color = MaterialTheme.colorScheme.error) }

        if (isLoading) {
            CircularProgressIndicator()
        } else if (bookings.isEmpty()) {
            Text("Aucune réservation.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(bookings, key = { it.id }) { booking ->
                    BookingItemCard(
                        booking = booking,
                        onChat = { receiverId, rideId ->
                            navController.navigate(Screen.Chat.createRoute(receiverId, rideId))
                        },
                    )
                }
            }
        }
    }
}

@Composable
private fun BookingItemCard(booking: BookingDto, onChat: (receiverId: String, rideId: String) -> Unit) {
    val ride = booking.ride
    val driverUserId = ride?.driver?.user?.id

    Card(shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                ride?.departureAddress ?: "Trajet",
                style = MaterialTheme.typography.titleMedium,
            )
            Text("→ ${ride?.arrivalAddress.orEmpty()}", style = MaterialTheme.typography.bodyMedium)
            Text(
                "${booking.seats} place(s) • ${booking.status}",
                style = MaterialTheme.typography.labelLarge,
            )
            if (!driverUserId.isNullOrBlank()) {
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedButton(
                    onClick = { onChat(driverUserId, booking.rideId) },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Icon(Icons.Default.Chat, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Contacter le conducteur")
                }
            }
        }
    }
}
