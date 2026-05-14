package com.ridemada.presentation.screens.driver

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ridemada.presentation.viewmodel.DriverViewModel

@Composable
fun BecomeDriverScreen(
    viewModel: DriverViewModel = hiltViewModel(),
    onSuccess: () -> Unit
) {
    var hasVehicle by remember { mutableStateOf(false) }
    var plate by remember { mutableStateOf("") }
    var brand by remember { mutableStateOf("") }
    var model by remember { mutableStateOf("") }
    var seats by remember { mutableStateOf("4") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Devenir Conducteur",
            style = MaterialTheme.typography.headlineLarge
        )

        Spacer(modifier = Modifier.height(24.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Informations du véhicule", style = MaterialTheme.typography.titleMedium)

                OutlinedTextField(
                    value = brand,
                    onValueChange = { brand = it },
                    label = { Text("Marque") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = model,
                    onValueChange = { model = it },
                    label = { Text("Modèle") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = plate,
                    onValueChange = { plate = it },
                    label = { Text("Plaque d'immatriculation") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = seats,
                    onValueChange = { seats = it },
                    label = { Text("Nombre de places") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = {
                viewModel.becomeDriver(
                    brand = brand,
                    model = model,
                    plate = plate,
                    seats = seats.toIntOrNull() ?: 4
                )
                onSuccess()
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Valider et devenir Conducteur")
        }

        Text(
            text = "Vos documents seront vérifiés par l'équipe RideMada",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}