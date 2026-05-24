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
    onRideCreated: () -> Unit,
) {
    var departureAddress by remember { mutableStateOf("") }
    var arrivalAddress by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var availableSeats by remember { mutableStateOf("3") }
    var selectedVehicleId by remember { mutableStateOf("") }
    val createState by viewModel.createState.collectAsState()
    val vehicles by viewModel.vehicles.collectAsState()

    LaunchedEffect(vehicles) {
        if (selectedVehicleId.isBlank() && vehicles.isNotEmpty()) {
            selectedVehicleId = vehicles.first().id
        }
    }

    LaunchedEffect(createState) {
        if (createState == "Trajet publié") {
            viewModel.clearCreateState()
            onRideCreated()
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Publier un trajet", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        if (vehicles.isEmpty()) {
            Text(
                "Ajoutez d'abord un véhicule dans Profil → Mes véhicules.",
                color = MaterialTheme.colorScheme.error,
            )
        } else {
            Text("Véhicule", style = MaterialTheme.typography.labelLarge)
            vehicles.forEach { vehicle ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = androidx.compose.ui.Alignment.CenterVertically,
                ) {
                    RadioButton(
                        selected = selectedVehicleId == vehicle.id,
                        onClick = { selectedVehicleId = vehicle.id },
                    )
                    Text("${vehicle.brand} ${vehicle.model} (${vehicle.plate})")
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = departureAddress,
            onValueChange = { departureAddress = it },
            label = { Text("Lieu de départ") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = arrivalAddress,
            onValueChange = { arrivalAddress = it },
            label = { Text("Destination") },
            modifier = Modifier.fillMaxWidth(),
        )
        Spacer(modifier = Modifier.height(12.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
                value = price,
                onValueChange = { price = it },
                label = { Text("Prix (Ar)") },
                modifier = Modifier.weight(1f),
            )
            OutlinedTextField(
                value = availableSeats,
                onValueChange = { availableSeats = it },
                label = { Text("Places") },
                modifier = Modifier.weight(1f),
            )
        }

        createState?.let { msg ->
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                msg,
                color = if (msg == "Trajet publié") MaterialTheme.colorScheme.primary
                else MaterialTheme.colorScheme.error,
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = {
                viewModel.createRide(
                    departureAddress = departureAddress.trim(),
                    arrivalAddress = arrivalAddress.trim(),
                    price = price.toDoubleOrNull() ?: 0.0,
                    seats = availableSeats.toIntOrNull() ?: 1,
                    vehicleId = selectedVehicleId,
                )
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = departureAddress.isNotBlank() && arrivalAddress.isNotBlank() &&
                (price.toDoubleOrNull() ?: 0.0) >= 1000 && selectedVehicleId.isNotBlank(),
        ) {
            Text("Publier le trajet")
        }
    }
}
