package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.CreateVehicleRequest
import com.ridemada.data.remote.dto.VehicleDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class VehicleViewModel @Inject constructor(
    private val api: RideMadaApi,
) : ViewModel() {

    private val _vehicles = MutableStateFlow<List<VehicleDto>>(emptyList())
    val vehicles = _vehicles.asStateFlow()

    private val _message = MutableStateFlow<String?>(null)
    val message = _message.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    init {
        loadVehicles()
    }

    fun loadVehicles() {
        viewModelScope.launch {
            _isLoading.value = true
            runCatching { api.getMyVehicles() }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        _vehicles.value = response.body()?.vehicles ?: emptyList()
                    } else {
                        _message.value = "Impossible de charger les véhicules"
                    }
                }
                .onFailure { _message.value = it.message }
            _isLoading.value = false
        }
    }

    fun addVehicle(brand: String, model: String, plate: String, seats: Int, color: String = "Standard") {
        viewModelScope.launch {
            _isLoading.value = true
            runCatching {
                api.addVehicle(
                    CreateVehicleRequest(brand, model, color, plate, seats, "SEDAN"),
                )
            }.onSuccess { response ->
                if (response.isSuccessful) {
                    _message.value = "Véhicule ajouté"
                    loadVehicles()
                } else {
                    _message.value = "Échec ajout véhicule"
                }
            }.onFailure { _message.value = it.message }
            _isLoading.value = false
        }
    }

    fun clearMessage() {
        _message.value = null
    }
}
