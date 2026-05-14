package com.ridemada.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "rides")
data class RideEntity(
    @PrimaryKey val id: String,
    val driverId: String,
    val departureAddress: String,
    val arrivalAddress: String,
    val departureLat: Double,
    val departureLng: Double,
    val arrivalLat: Double,
    val arrivalLng: Double,
    val price: Double,
    val availableSeats: Int,
    val departureTime: Long,
    val status: String,
    val cachedAt: Long = System.currentTimeMillis()
)