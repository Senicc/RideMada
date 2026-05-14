package com.ridemada.presentation.screens.booking

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ridemada.presentation.viewmodel.BookingViewModel

@Composable
fun BookingScreen(
    rideId: String,
    viewModel: BookingViewModel = hiltViewModel()
) {
    var selectedSeats by remember { mutableStateOf(1) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Confirmer la réservation",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(24.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Nombre de places")
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    (1..4).forEach { num ->
                        FilterChip(
                            selected = selectedSeats == num,
                            onClick = { selectedSeats = num },
                            label = { Text("$num") }
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = { viewModel.createBooking(rideId, selectedSeats) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Réserver maintenant")
        }

        OutlinedButton(
            onClick = { /* Annuler */ },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Annuler")
        }
    }
}