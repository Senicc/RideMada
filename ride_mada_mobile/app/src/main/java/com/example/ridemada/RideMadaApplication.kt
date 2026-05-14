package com.ridemada

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class RideMadaApplication : Application() {

    @Inject
    lateinit var syncManager: SyncManager

    override fun onCreate() {
        super.onCreate()

        // Démarrer la synchronisation automatique
        syncManager.startSync()
    }
}