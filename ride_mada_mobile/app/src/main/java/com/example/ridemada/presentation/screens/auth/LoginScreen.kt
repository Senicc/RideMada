package com.ridemada.presentation.screens.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavHostController
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.components.RideMadaTextField
import com.ridemada.presentation.navigation.RoleNavigation
import com.ridemada.presentation.navigation.Screen
import com.ridemada.presentation.viewmodel.AuthState
import com.ridemada.presentation.viewmodel.AuthViewModel
import com.ridemada.presentation.viewmodel.MainViewModel

@Composable
fun LoginScreen(
    navController: NavHostController,
    viewModel: AuthViewModel = hiltViewModel(),
    mainViewModel: MainViewModel = hiltViewModel(),
) {
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val authState by viewModel.authState.collectAsState()

    LaunchedEffect(authState) {
        when (authState) {
            is AuthState.Success -> {
                val role = viewModel.currentUserRole()
                mainViewModel.refreshRole()
                viewModel.resetState()
                navController.navigate(RoleNavigation.homeForRole(role)) {
                    popUpTo(Screen.Login.route) { inclusive = true }
                }
            }
            is AuthState.NeedsOtp -> {
                val phoneOtp = (authState as AuthState.NeedsOtp).phone
                viewModel.resetState()
                navController.navigate("${Screen.Otp.route}/$phoneOtp")
            }
            else -> Unit
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp),
            horizontalAlignment = Alignment.Start,
        ) {
            Spacer(modifier = Modifier.height(100.dp))
            
            Text(
                text = "RideMada",
                fontSize = 44.sp,
                fontWeight = FontWeight.Black,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Entrez votre numéro pour continuer",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(48.dp))

            RideMadaTextField(
                value = phone,
                onValueChange = { phone = it },
                label = "Numéro de téléphone",
                icon = Icons.Default.Phone,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
            )
            Spacer(modifier = Modifier.height(16.dp))
            RideMadaTextField(
                value = password,
                onValueChange = { password = it },
                label = "Mot de passe",
                icon = Icons.Default.Lock,
                visualTransformation = PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
            )
            
            if (authState is AuthState.Error) {
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = (authState as AuthState.Error).message,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall
                )
            }

            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Mot de passe oublié ?",
                color = MaterialTheme.colorScheme.secondary,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .clickable { navController.navigate(Screen.ForgotPassword.route) }
                    .padding(vertical = 8.dp)
            )

            Spacer(modifier = Modifier.weight(1f))
            
            RideMadaButton(
                text = "Continuer",
                onClick = { viewModel.login(phone.trim(), password) },
                isLoading = authState is AuthState.Loading,
                enabled = phone.isNotBlank() && password.length >= 6
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            Row(
                modifier = Modifier.fillMaxWidth().padding(bottom = 32.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Nouveau ici ? ",
                    color = MaterialTheme.colorScheme.onBackground
                )
                Text(
                    text = "Créer un compte",
                    color = MaterialTheme.colorScheme.secondary,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier
                        .clickable { navController.navigate(Screen.Register.route) }
                        .padding(4.dp)
                )
            }
        }
    }
}
