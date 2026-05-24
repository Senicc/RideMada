package com.ridemada.presentation.screens.driver

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ridemada.data.remote.dto.VehicleDto
import com.ridemada.presentation.viewmodel.VehicleViewModel

@Composable
fun MyVehiclesScreen(viewModel: VehicleViewModel = hiltViewModel()) {
    val vehicles by viewModel.vehicles.collectAsState()
    val message by viewModel.message.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()

    var showAddDialog by remember { mutableStateOf(false) }
    var brand by remember { mutableStateOf("") }
    var model by remember { mutableStateOf("") }
    var plate by remember { mutableStateOf("") }
    var seats by remember { mutableStateOf("4") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Mes véhicules", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(12.dp))

        message?.let {
            Text(it, color = MaterialTheme.colorScheme.primary)
            LaunchedEffect(it) { viewModel.clearMessage() }
        }

        if (isLoading && vehicles.isEmpty()) {
            CircularProgressIndicator()
        } else if (vehicles.isEmpty()) {
            Text("Aucun véhicule enregistré.", color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                items(vehicles, key = { it.id }) { vehicle ->
                    VehicleCard(vehicle)
                }
            }
        }

        Spacer(modifier = Modifier.weight(1f))
        Button(onClick = { showAddDialog = true }, modifier = Modifier.fillMaxWidth()) {
            Text("Ajouter un véhicule")
        }
    }

    if (showAddDialog) {
        AlertDialog(
            onDismissRequest = { showAddDialog = false },
            title = { Text("Nouveau véhicule") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(brand, { brand = it }, label = { Text("Marque") })
                    OutlinedTextField(model, { model = it }, label = { Text("Modèle") })
                    OutlinedTextField(plate, { plate = it }, label = { Text("Plaque") })
                    OutlinedTextField(seats, { seats = it }, label = { Text("Places") })
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.addVehicle(brand, model, plate, seats.toIntOrNull() ?: 4)
                        showAddDialog = false
                        brand = ""
                        model = ""
                        plate = ""
                    },
                ) { Text("Ajouter") }
            },
            dismissButton = {
                TextButton(onClick = { showAddDialog = false }) { Text("Annuler") }
            },
        )
    }
}

@Composable
private fun VehicleCard(vehicle: VehicleDto) {
    Card(shape = RoundedCornerShape(12.dp), modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("${vehicle.brand} ${vehicle.model}", style = MaterialTheme.typography.titleMedium)
            Text("Plaque: ${vehicle.plate} • ${vehicle.seats} places", style = MaterialTheme.typography.bodyMedium)
            Text(vehicle.type, style = MaterialTheme.typography.labelSmall)
        }
    }
}
