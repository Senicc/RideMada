package com.ridemada.data.repository

import com.ridemada.data.remote.RideMadaApi
import com.ridemada.domain.model.DriverLocation
import com.ridemada.domain.repository.MapRepositoryImpl
import javax.inject.Inject

class MapRepositoryImpl @Inject constructor(
    private val api: RideMadaApi,
    private val socketService: SocketService
) : MapRepositoryImpl {

    override suspend fun getNearbyDrivers(lat: Double, lng: Double, radius: Double): List<DriverLocation> {
        // Appel API
        val response = api.getNearbyDrivers(/* request */)
        return response.body()?.drivers ?: emptyList()
    }

    override suspend fun updateMyLocation(lat: Double, lng: Double) {
        socketService.updateLocation(lat, lng)
    }
}