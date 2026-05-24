package com.ridemada.data.local

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import com.google.gson.Gson
import com.ridemada.data.remote.dto.UserDto
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SessionDataStore @Inject constructor(
    @ApplicationContext context: Context,
    private val gson: Gson,
) {
    private val prefs = EncryptedSharedPreferences.create(
        context,
        "ridemada_secure_session",
        MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    suspend fun saveSession(accessToken: String, refreshToken: String, user: UserDto) {
        prefs.edit()
            .putString(KEY_ACCESS, accessToken)
            .putString(KEY_REFRESH, refreshToken)
            .putString(KEY_USER, gson.toJson(user))
            .apply()
    }

    suspend fun clear() {
        prefs.edit().clear().apply()
    }

    suspend fun getAccessToken(): String? = prefs.getString(KEY_ACCESS, null)

    suspend fun getRefreshToken(): String? = prefs.getString(KEY_REFRESH, null)

    suspend fun getUser(): UserDto? {
        val json = prefs.getString(KEY_USER, null) ?: return null
        return runCatching { gson.fromJson(json, UserDto::class.java) }.getOrNull()
    }

    suspend fun isLoggedIn(): Boolean = !getAccessToken().isNullOrBlank()

    companion object {
        private const val KEY_ACCESS = "access_token"
        private const val KEY_REFRESH = "refresh_token"
        private const val KEY_USER = "user_json"
    }
}
