package com.ridemada.presentation.screens.ride

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ridemada.presentation.viewmodel.RideViewModel

@Composable
fun CreateRideScreen(
    viewModel: RideViewModel = hiltViewModel(),
    onRideCreated: () -> Unit
) {
    var departureAddress by remember { mutableStateOf("") }
    var arrivalAddress by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var availableSeats by remember { mutableStateOf("3") }
    var departureTime by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Publier un trajet",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = departureAddress,
            onValueChange = { departureAddress = it },
            label = { Text("Lieu de départ") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = arrivalAddress,
            onValueChange = { arrivalAddress = it },
            label = { Text("Destination") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
            OutlinedTextField(
                value = price,
                onValueChange = { price = it },
                label = { Text("Prix (Ar)") },
                modifier = Modifier.weight(1f)
            )
            OutlinedTextField(
                value = availableSeats,
                onValueChange = { availableSeats = it },
                label = { Text("Places") },
                modifier = Modifier.weight(1f)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                viewModel.createRide(
                    departureAddress = departureAddress,
                    arrivalAddress = arrivalAddress,
                    price = price.toDoubleOrNull() ?: 0.0,
                    seats = availableSeats.toIntOrNull() ?: 3
                )
                onRideCreated()
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Publier le trajet")
        }
    }
}