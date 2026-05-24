package com.ridemada

import android.app.Application
import com.ridemada.data.local.TokenManager
import com.ridemada.data.sync.SyncManager
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltAndroidApp
class RideMadaApplication : Application() {

    @Inject lateinit var syncManager: SyncManager
    @Inject lateinit var tokenManager: TokenManager

    private val appScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        appScope.launch { tokenManager.loadFromStorage() }
        syncManager.startSync()
    }
}
