package com.ridemada.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.data.remote.dto.FavoriteDto
import com.ridemada.data.remote.dto.FavoriteRequest
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FavoritesViewModel @Inject constructor(private val api: RideMadaApi) : ViewModel() {
    private val _favorites = MutableStateFlow<List<FavoriteDto>>(emptyList())
    val favorites = _favorites.asStateFlow()
    private val _loading = MutableStateFlow(true)
    val loading = _loading.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _loading.value = true
            runCatching { api.getFavorites() }
                .onSuccess { r -> if (r.isSuccessful) _favorites.value = r.body()?.favorites.orEmpty() }
            _loading.value = false
        }
    }

    fun addHome(address: String, lat: Double, lng: Double) = add("HOME", "Maison", address, lat, lng)
    fun addWork(address: String, lat: Double, lng: Double) = add("WORK", "Travail", address, lat, lng)

    private fun add(type: String, label: String, address: String, lat: Double, lng: Double) {
        viewModelScope.launch {
            runCatching {
                api.addFavorite(FavoriteRequest(type = type, label = label, address = address, lat = lat, lng = lng))
            }.onSuccess { if (it.isSuccessful) load() }
        }
    }

    fun delete(id: String) {
        viewModelScope.launch {
            runCatching { api.deleteFavorite(id) }.onSuccess { if (it.isSuccessful) load() }
        }
    }
}
