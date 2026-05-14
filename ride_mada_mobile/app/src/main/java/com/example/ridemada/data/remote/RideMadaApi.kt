package com.ridemada.data.remote

import com.ridemada.data.remote.dto.AuthResponse
import com.ridemada.data.remote.dto.LoginRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface RideMadaApi {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("rides/nearby")
    suspend fun getNearbyRides(@Body request: NearbyRidesRequest): Response<RidesResponse>

    // À compléter : rides, bookings, drivers, etc.
}