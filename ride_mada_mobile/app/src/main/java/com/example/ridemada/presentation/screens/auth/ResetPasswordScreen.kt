package com.ridemada.presentation.screens.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.AuthState
import com.ridemada.presentation.viewmodel.AuthViewModel

@Composable
fun ResetPasswordScreen(
    phone: String,
    navController: NavHostController,
    viewModel: AuthViewModel = hiltViewModel(),
) {
    var otp by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    val authState by viewModel.authState.collectAsState()

    LaunchedEffect(authState) {
        when (authState) {
            is AuthState.PasswordResetSuccess -> {
                viewModel.resetState()
                navController.navigate(Screen.Login.route) {
                    popUpTo(Screen.ForgotPassword.route) { inclusive = true }
                }
            }
            else -> Unit
        }
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Text("Nouveau mot de passe", style = MaterialTheme.typography.headlineMedium)
        Text("Code envoyé au $phone", style = MaterialTheme.typography.bodyMedium)
        Spacer(modifier = Modifier.height(24.dp))

        OutlinedTextField(
            value = otp,
            onValueChange = { otp = it },
            label = { Text("Code OTP") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = newPassword,
            onValueChange = { newPassword = it },
            label = { Text("Nouveau mot de passe") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = confirmPassword,
            onValueChange = { confirmPassword = it },
            label = { Text("Confirmer le mot de passe") },
            visualTransformation = PasswordVisualTransformation(),
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
        )

        if (authState is AuthState.Error) {
            Text(
                (authState as AuthState.Error).message,
                color = MaterialTheme.colorScheme.error,
                modifier = Modifier.padding(top = 8.dp),
            )
        }

        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = {
                if (newPassword == confirmPassword && newPassword.length >= 6) {
                    viewModel.resetPassword(phone, otp.trim(), newPassword)
                }
            },
            modifier = Modifier.fillMaxWidth(),
            enabled = authState !is AuthState.Loading &&
                otp.isNotBlank() &&
                newPassword.length >= 6 &&
                newPassword == confirmPassword,
        ) {
            Text(if (authState is AuthState.Loading) "..." else "Réinitialiser")
        }
        TextButton(onClick = { navController.popBackStack() }) {
            Text("Retour")
        }
    }
}
