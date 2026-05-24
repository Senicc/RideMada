package com.ridemada.presentation.screens.auth

import  androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.viewmodel.AuthState
import com.ridemada.presentation.viewmodel.AuthViewModel
import com.ridemada.presentation.navigation.Screen

@Composable
fun ForgotPasswordScreen(
    navController: NavHostController,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    var phone by remember { mutableStateOf("") }
    val authState by viewModel.authState.collectAsState()

    LaunchedEffect(authState) {
        if (authState is AuthState.ForgotPasswordSent) {
            val p = (authState as AuthState.ForgotPasswordSent).phone
            viewModel.resetState()
            navController.navigate("${Screen.ResetPassword.route}/$p")
        }
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Mot de passe oublié", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))
        OutlinedTextField(
            value = phone,
            onValueChange = { phone = it },
            label = { Text("Numéro de téléphone") },
            modifier = Modifier.fillMaxWidth(),
        )
        if (authState is AuthState.ForgotPasswordSent) {
            Text(
                "Un code a été envoyé par SMS.",
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(top = 8.dp),
            )
        }
        if (authState is AuthState.Error) {
            Text((authState as AuthState.Error).message, color = MaterialTheme.colorScheme.error)
        }
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = { viewModel.forgotPassword(phone.trim()) },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text("Envoyer le code")
        }
        TextButton(onClick = { navController.popBackStack() }) {
            Text("Retour")
        }
    }
}
