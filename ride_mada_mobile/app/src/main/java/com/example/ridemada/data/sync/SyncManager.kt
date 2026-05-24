package com.ridemada.data.sync

import com.ridemada.data.local.dao.RideDao
import com.ridemada.data.remote.RideMadaApi
import com.ridemada.domain.repository.MapRepository
import com.ridemada.utils.NetworkConnectivityObserver
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncManager @Inject constructor(
    private val networkObserver: NetworkConnectivityObserver,
    private val mapRepository: MapRepository,
    private val rideDao: RideDao,
) {
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())

    fun startSync() {
        scope.launch {
            networkObserver.observe().collectLatest { isConnected ->
                if (isConnected) performSync()
            }
        }
    }

    private suspend fun performSync() {
        runCatching {
            val cached = rideDao.getAvailableRides(System.currentTimeMillis()).first()
            if (cached.isNotEmpty()) return@runCatching
            mapRepository.getNearbyRides(-18.8792, 47.5079)
        }
    }
}
