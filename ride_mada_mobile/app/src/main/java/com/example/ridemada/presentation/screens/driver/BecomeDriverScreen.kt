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
    onSuccess: () -> Unit,
) {
    var brand by remember { mutableStateOf("") }
    var model by remember { mutableStateOf("") }
    var plate by remember { mutableStateOf("") }
    var seats by remember { mutableStateOf("4") }
    val state by viewModel.state.collectAsState()
    val isSuccess = state?.contains("envoyée", ignoreCase = true) == true

    LaunchedEffect(isSuccess) {
        if (isSuccess) {
            viewModel.clearState()
            onSuccess()
        }
    }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Devenir conducteur", style = MaterialTheme.typography.headlineLarge)
        Spacer(modifier = Modifier.height(24.dp))

        Card(modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text("Informations du véhicule", style = MaterialTheme.typography.titleMedium)
                OutlinedTextField(value = brand, onValueChange = { brand = it }, label = { Text("Marque") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = model, onValueChange = { model = it }, label = { Text("Modèle") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = plate, onValueChange = { plate = it }, label = { Text("Plaque") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = seats, onValueChange = { seats = it }, label = { Text("Places") }, modifier = Modifier.fillMaxWidth())
            }
        }

        state?.let { msg ->
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                msg,
                color = if (isSuccess) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.error,
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = {
                viewModel.becomeDriver(
                    brand = brand.trim(),
                    model = model.trim(),
                    plate = plate.trim(),
                    seats = seats.toIntOrNull() ?: 4,
                )
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = brand.isNotBlank() && model.isNotBlank() && plate.isNotBlank(),
        ) {
            Text("Envoyer la demande")
        }

        Text(
            "Vos documents seront vérifiés par l'équipe RideMada.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 8.dp),
        )
    }
}
