package com.ridemada.domain.repository

import com.ridemada.domain.model.DriverLocation
import com.ridemada.domain.model.Ride

interface MapRepository {
    suspend fun getNearbyDrivers(lat: Double, lng: Double, radius: Double = 15.0): List<DriverLocation>
    suspend fun getNearbyRides(lat: Double, lng: Double): List<Ride>
    suspend fun updateMyLocation(lat: Double, lng: Double)
}
