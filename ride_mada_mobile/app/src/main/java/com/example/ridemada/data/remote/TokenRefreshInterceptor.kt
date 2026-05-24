package com.ridemada.data.remote

import com.google.gson.Gson
import com.ridemada.BuildConfig
import com.ridemada.data.local.TokenManager
import com.ridemada.data.remote.dto.AuthResponse
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import javax.inject.Inject

class TokenRefreshInterceptor @Inject constructor(
    private val tokenManager: TokenManager,
    private val gson: Gson,
) : Interceptor {

    private val refreshClient = OkHttpClient()

    override fun intercept(chain: Interceptor.Chain): Response {
        val response = chain.proceed(chain.request())
        if (response.code != 401 || chain.request().url.encodedPath.contains("auth/")) {
            return response
        }

        val refresh = tokenManager.refreshToken ?: return response
        response.close()

        val body = gson.toJson(mapOf("refreshToken" to refresh))
            .toRequestBody("application/json".toMediaType())

        val refreshRequest = Request.Builder()
            .url("${BuildConfig.API_BASE_URL}auth/refresh")
            .post(body)
            .build()

        val refreshResponse = refreshClient.newCall(refreshRequest).execute()
        if (!refreshResponse.isSuccessful) {
            return chain.proceed(chain.request())
        }

        val authBody = gson.fromJson(refreshResponse.body?.string(), AuthResponse::class.java)
        val newAccess = authBody.accessToken ?: return chain.proceed(chain.request())
        val newRefresh = authBody.refreshToken ?: refresh

        tokenManager.updateTokens(newAccess, newRefresh)

        val retry = chain.request().newBuilder()
            .header("Authorization", "Bearer $newAccess")
            .build()
        return chain.proceed(retry)
    }
}
