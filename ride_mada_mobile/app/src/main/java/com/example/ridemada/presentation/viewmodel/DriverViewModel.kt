package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.BecomeDriverRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DriverViewModel @Inject constructor(
    private val api: RideMadaApi,
) : ViewModel() {

    private val _state = MutableStateFlow<String?>(null)
    val state = _state.asStateFlow()

    fun clearState() {
        _state.value = null
    }

    fun becomeDriver(brand: String, model: String, plate: String, seats: Int) {
        viewModelScope.launch {
            runCatching {
                api.becomeDriver(
                    BecomeDriverRequest(
                        documents = mapOf("plate" to plate),
                        brand = brand,
                        model = model,
                        color = "Standard",
                        plate = plate,
                        seats = seats,
                        type = "SEDAN",
                    ),
                )
            }.onSuccess { response ->
                _state.value = if (response.isSuccessful) {
                    "Demande envoyée — validation en cours"
                } else {
                    response.message()
                }
            }.onFailure {
                _state.value = it.message
            }
        }
    }
}
