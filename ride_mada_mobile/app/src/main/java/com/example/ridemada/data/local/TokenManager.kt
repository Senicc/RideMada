package com.ridemada.data.local

import com.ridemada.data.remote.dto.UserDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class TokenManager @Inject constructor(
    private val session: SessionDataStore,
) {
    @Volatile
    var accessToken: String? = null
        private set

    @Volatile
    var refreshToken: String? = null
        private set

    suspend fun loadFromStorage() {
        accessToken = session.getAccessToken()
        refreshToken = session.getRefreshToken()
    }

    suspend fun persist(access: String, refresh: String, user: UserDto) {
        session.saveSession(access, refresh, user)
        accessToken = access
        refreshToken = refresh
    }

    suspend fun clear() {
        session.clear()
        accessToken = null
        refreshToken = null
    }

    fun updateTokens(access: String, refresh: String) {
        accessToken = access
        refreshToken = refresh
    }
}
