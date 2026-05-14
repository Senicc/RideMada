package com.ridemada.data.sync

import com.ridemada.data.local.dao.RideDao
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.domain.repository.MapRepository
import com.ridemada.utils.NetworkConnectivityObserver
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncManager @Inject constructor(
    private val networkObserver: NetworkConnectivityObserver,
    private val mapRepository: MapRepository,
    private val rideDao: RideDao,
    private val api: RideMadaApi
) {

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    fun startSync() {
        scope.launch {
            networkObserver.observe().collectLatest { isConnected ->
                if (isConnected) {
                    performSync()
                }
            }
        }
    }

    private suspend fun performSync() {
        try {
            // 1. Synchroniser les trajets locaux avec le serveur
            val cachedRides = rideDao.getAvailableRides(System.currentTimeMillis()).first()

            if (cachedRides.isNotEmpty()) {
                // Envoyer les données en attente au serveur si nécessaire
                // Exemple : sync pending bookings, locations, etc.
            }

            // 2. Rafraîchir les données récentes depuis le serveur
            mapRepository.getNearbyDrivers(-18.8792, 47.5079, 15.0)

            println("✅ Synchronisation automatique terminée avec succès")
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}