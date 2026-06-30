package com.ridemada.presentation.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.components.RideMadaTextField
import com.ridemada.presentation.viewmodel.EditProfileViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    navController: NavHostController,
    viewModel: EditProfileViewModel = hiltViewModel(),
) {
    val initialName by viewModel.name.collectAsState()
    val initialEmail by viewModel.email.collectAsState()
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(initialName, initialEmail) {
        if (name.isBlank()) name = initialName
        if (email.isBlank()) email = initialEmail
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Informations personnelles", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Retour")
                    }
                },
            )
        },
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp),
        ) {
            RideMadaTextField(value = name, onValueChange = { name = it }, label = "Nom complet", icon = Icons.Default.Person)
            Spacer(modifier = Modifier.height(12.dp))
            RideMadaTextField(value = email, onValueChange = { email = it }, label = "Email (optionnel)", icon = Icons.Default.Email)
            error?.let {
                Spacer(modifier = Modifier.height(8.dp))
                Text(it, color = MaterialTheme.colorScheme.error)
            }
            Spacer(modifier = Modifier.weight(1f))
            RideMadaButton(
                text = "Enregistrer",
                onClick = { viewModel.save(name, email) { navController.popBackStack() } },
                enabled = name.isNotBlank() && !loading,
                isLoading = loading,
            )
        }
    }
}
