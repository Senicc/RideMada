package com.ridemada.presentation.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil.compose.AsyncImage
import com.ridemada.presentation.viewmodel.ProfileViewModel

@Composable
fun ProfileScreen(viewModel: ProfileViewModel = hiltViewModel()) {
    val user by viewModel.user.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(32.dp))

        AsyncImage(
            model = user?.photo ?: "https://via.placeholder.com/150",
            contentDescription = "Photo de profil",
            modifier = Modifier
                .size(120.dp)
                .padding(8.dp)
        )

        Text(
            text = user?.name ?: "Utilisateur",
            style = MaterialTheme.typography.headlineMedium
        )

        Text(
            text = user?.phone ?: "",
            style = MaterialTheme.typography.bodyLarge
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(onClick = { /* Devenir Conducteur */ }, modifier = Modifier.fillMaxWidth()) {
            Text("Devenir Conducteur")
        }

        OutlinedButton(onClick = { /* Historique */ }, modifier = Modifier.fillMaxWidth()) {
            Text("Historique des trajets")
        }

        OutlinedButton(onClick = { /* Paramètres */ }, modifier = Modifier.fillMaxWidth()) {
            Text("Paramètres")
        }

        OutlinedButton(
            onClick = { navController.navigate(Screen.BecomeDriver.route) },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Devenir Conducteur")
        }
    }
}