package com.ridemada.domain.model

data class DriverLocation(
    val id: String,
    val name: String,
    val lat: Double,
    val lng: Double,
    val distance: Double = 0.0,
    val rating: Float = 5f,
)

data class Ride(
    val id: String,
    val driverName: String,
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
)
