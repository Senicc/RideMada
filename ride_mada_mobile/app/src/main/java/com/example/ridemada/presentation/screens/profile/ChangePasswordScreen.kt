package com.ridemada.presentation.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavHostController
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.ChangePasswordRequest
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.components.RideMadaTextField
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChangePasswordViewModel @Inject constructor(private val api: RideMadaApi) : ViewModel() {
    private val _loading = MutableStateFlow(false)
    val loading = _loading.asStateFlow()
    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()
    private val _success = MutableStateFlow(false)
    val success = _success.asStateFlow()

    fun changePassword(current: String, newPassword: String) {
        viewModelScope.launch {
            _loading.value = true
            _error.value = null
            runCatching { api.changePassword(ChangePasswordRequest(current, newPassword)) }
                .onSuccess { response ->
                    if (response.isSuccessful && response.body()?.success == true) {
                        _success.value = true
                    } else {
                        _error.value = response.body()?.message ?: response.message()
                    }
                }
                .onFailure { _error.value = it.message }
            _loading.value = false
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChangePasswordScreen(
    navController: NavHostController,
    viewModel: ChangePasswordViewModel = hiltViewModel(),
) {
    var current by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()
    val success by viewModel.success.collectAsState()

    LaunchedEffect(success) {
        if (success) navController.popBackStack()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Sécurité", fontWeight = FontWeight.Bold) },
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
            RideMadaTextField(value = current, onValueChange = { current = it }, label = "Mot de passe actuel", icon = Icons.Default.Lock, visualTransformation = PasswordVisualTransformation())
            Spacer(modifier = Modifier.height(12.dp))
            RideMadaTextField(value = newPassword, onValueChange = { newPassword = it }, label = "Nouveau mot de passe", icon = Icons.Default.Lock, visualTransformation = PasswordVisualTransformation())
            Spacer(modifier = Modifier.height(12.dp))
            RideMadaTextField(value = confirm, onValueChange = { confirm = it }, label = "Confirmer", icon = Icons.Default.Lock, visualTransformation = PasswordVisualTransformation())
            error?.let {
                Spacer(modifier = Modifier.height(8.dp))
                Text(it, color = MaterialTheme.colorScheme.error)
            }
            Spacer(modifier = Modifier.weight(1f))
            RideMadaButton(
                text = "Mettre à jour",
                onClick = {
                    if (newPassword == confirm && newPassword.length >= 6) {
                        viewModel.changePassword(current, newPassword)
                    }
                },
                enabled = current.isNotBlank() && newPassword.length >= 6 && newPassword == confirm && !loading,
                isLoading = loading,
            )
        }
    }
}
