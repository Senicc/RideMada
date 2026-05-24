package com.ridemada.domain.model

enum class UserRole(val apiValue: String) {
    PASSENGER("PASSENGER"),
    DRIVER("DRIVER"),
    ADMIN("ADMIN");

    companion object {
        fun fromApi(value: String?): UserRole =
            entries.find { it.apiValue == value } ?: PASSENGER
    }
}

fun UserRole.homeRoute(): String = when (this) {
    UserRole.ADMIN -> "admin_dashboard_screen"
    UserRole.DRIVER -> "driver_dashboard_screen"
    UserRole.PASSENGER -> "home_screen"
}
