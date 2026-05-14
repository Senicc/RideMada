package com.ridemada.data.repository

import com.ridemada.data.local.dao.RideDao
import com.ridemada.data.local.entity.RideEntity
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.domain.model.DriverLocation
import com.ridemada.domain.repository.MapRepository
import com.ridemada.services.SocketService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class MapRepositoryImpl @Inject constructor(
    private val api: RideMadaApi,
    private val rideDao: RideDao,
    private val socketService: SocketService
) : MapRepository {

    /**
     * Récupère les conducteurs/trajets proches avec support hors-ligne
     */
    override suspend fun getNearbyDrivers(
        lat: Double,
        lng: Double,
        radius: Double
    ): List<DriverLocation> {
        return try {
            // 1. Essayer de récupérer les données en ligne
            val response = api.getNearbyRides(
                // Vous pouvez créer un DTO pour la requête si besoin
                lat = lat,
                lng = lng,
                radius = radius
            )

            if (response.isSuccessful && response.body() != null) {
                val rides = response.body()!!.rides

                // Sauvegarder en cache (Room)
                rideDao.insertRides(rides.map { it.toEntity() })

                // Convertir en modèle domaine
                rides.map { it.toDomain() }
            } else {
                getCachedNearbyDrivers()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            // En cas d'erreur (pas de connexion) → Mode hors-ligne
            getCachedNearbyDrivers()
        }
    }

    /**
     * Récupère les données depuis le cache local (hors-ligne)
     */
    private suspend fun getCachedNearbyDrivers(): List<DriverLocation> {
        return rideDao.getAvailableRides(System.currentTimeMillis())
            .first()
            .map { it.toDomain() }
    }

    /**
     * Mise à jour de la position en temps réel via Socket.IO
     */
    override suspend fun updateMyLocation(lat: Double, lng: Double) {
        try {
            // Envoi au backend en temps réel
            socketService.updateLocation(lat, lng)

            // Optionnel : Sauvegarder localement la dernière position
            // userDao.updateLastLocation(...)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Flow pour observer les trajets en cache (utile pour UI en temps réel)
     */
    fun observeCachedRides(): Flow<List<RideEntity>> {
        return rideDao.getAvailableRides(System.currentTimeMillis())
    }
}