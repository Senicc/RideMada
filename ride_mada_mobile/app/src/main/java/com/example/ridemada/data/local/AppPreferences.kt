package com.ridemada.data.local

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.appDataStore: DataStore<Preferences> by preferencesDataStore(name = "ridemada_prefs")

enum class ThemeMode { SYSTEM, LIGHT, DARK }

@Singleton
class AppPreferences @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    val onboardingCompleted: Flow<Boolean> = context.appDataStore.data.map { prefs ->
        prefs[KEY_ONBOARDING_DONE] ?: false
    }

    val themeMode: Flow<ThemeMode> = context.appDataStore.data.map { prefs ->
        when (prefs[KEY_THEME]) {
            "LIGHT" -> ThemeMode.LIGHT
            "DARK" -> ThemeMode.DARK
            else -> ThemeMode.SYSTEM
        }
    }

    val language: Flow<String> = context.appDataStore.data.map { prefs ->
        prefs[KEY_LANGUAGE] ?: "fr"
    }

    suspend fun setOnboardingCompleted() {
        context.appDataStore.edit { it[KEY_ONBOARDING_DONE] = true }
    }

    suspend fun setThemeMode(mode: ThemeMode) {
        context.appDataStore.edit {
            it[KEY_THEME] = when (mode) {
                ThemeMode.LIGHT -> "LIGHT"
                ThemeMode.DARK -> "DARK"
                ThemeMode.SYSTEM -> "SYSTEM"
            }
        }
    }

    suspend fun setLanguage(lang: String) {
        context.appDataStore.edit { it[KEY_LANGUAGE] = lang }
    }

    companion object {
        private val KEY_ONBOARDING_DONE = booleanPreferencesKey("onboarding_done")
        private val KEY_THEME = stringPreferencesKey("theme_mode")
        private val KEY_LANGUAGE = stringPreferencesKey("language")
    }
}
