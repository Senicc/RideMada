package com.ridemada.presentation.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.NavHostController
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.ReportRequest
import com.ridemada.presentation.components.RideMadaButton
import com.ridemada.presentation.components.RideMadaTextField
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReportViewModel @Inject constructor(private val api: RideMadaApi) : ViewModel() {
    private val _loading = MutableStateFlow(false)
    val loading = _loading.asStateFlow()
    private val _success = MutableStateFlow(false)
    val success = _success.asStateFlow()
    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    fun submit(reportedId: String, reason: String, onDone: () -> Unit) {
        viewModelScope.launch {
            _loading.value = true
            runCatching { api.createReport(ReportRequest(reportedId, reason)) }
                .onSuccess { r ->
                    if (r.isSuccessful) {
                        _success.value = true
                        onDone()
                    } else _error.value = r.message()
                }
                .onFailure { _error.value = it.message }
            _loading.value = false
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(
    navController: NavHostController,
    viewModel: ReportViewModel = hiltViewModel(),
) {
    var reportedId by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    val loading by viewModel.loading.collectAsState()
    val error by viewModel.error.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Signaler un problème", fontWeight = FontWeight.Bold) },
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
            RideMadaTextField(value = reportedId, onValueChange = { reportedId = it }, label = "ID utilisateur signalé")
            Spacer(modifier = Modifier.height(12.dp))
            RideMadaTextField(value = reason, onValueChange = { reason = it }, label = "Description du problème", singleLine = false)
            error?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp)) }
            Spacer(modifier = Modifier.weight(1f))
            RideMadaButton(
                text = "Envoyer",
                onClick = { viewModel.submit(reportedId, reason) { navController.popBackStack() } },
                enabled = reportedId.isNotBlank() && reason.length >= 10 && !loading,
                isLoading = loading,
            )
        }
    }
}
