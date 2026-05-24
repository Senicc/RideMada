package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.BookingDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BookingsViewModel @Inject constructor(
    private val api: RideMadaApi,
) : ViewModel() {

    private val _bookings = MutableStateFlow<List<BookingDto>>(emptyList())
    val bookings = _bookings.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading = _isLoading.asStateFlow()

    private val _error = MutableStateFlow<String?>(null)
    val error = _error.asStateFlow()

    init {
        loadBookings()
    }

    fun loadBookings() {
        viewModelScope.launch {
            _isLoading.value = true
            _error.value = null
            runCatching { api.getMyBookings() }
                .onSuccess { response ->
                    if (response.isSuccessful) {
                        _bookings.value = response.body()?.bookings ?: emptyList()
                    } else {
                        _error.value = "Erreur chargement réservations"
                    }
                }
                .onFailure { _error.value = it.message }
            _isLoading.value = false
        }
    }
}
