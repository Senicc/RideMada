package com.ridemada.data.remote.dto

import com.google.gson.annotations.SerializedName

data class AuthResponse(
    val success: Boolean,
    val message: String? = null,
    val accessToken: String? = null,
    val refreshToken: String? = null,
    val user: UserDto? = null,
    val requiresVerification: Boolean? = null,
    val userId: String? = null,
    val tempOTP: String? = null,
)

data class LoginRequest(val phone: String, val password: String)

data class RegisterRequest(
    val name: String,
    val phone: String,
    val password: String,
    val role: String = "PASSENGER",
)

data class OtpRequest(val phone: String, val otp: String)

data class ForgotPasswordRequest(val phone: String)

data class ResetPasswordRequest(val phone: String, val otp: String, val newPassword: String)

data class FcmTokenRequest(val fcmToken: String)

data class UserDto(
    val id: String,
    val name: String,
    val phone: String,
    val email: String? = null,
    val role: String,
    val photo: String? = null,
    val rating: Float = 5f,
    val isVerified: Boolean = false,
)

data class NearbyQuery(
    @SerializedName("lat") val lat: Double,
    @SerializedName("lng") val lng: Double,
    @SerializedName("radius") val radius: Double = 15.0,
)

data class RidesResponse(val success: Boolean, val rides: List<RideDto>?)

data class RideDto(
    val id: String,
    val departureAddress: String,
    val arrivalAddress: String,
    val departureLat: Double,
    val departureLng: Double,
    val arrivalLat: Double,
    val arrivalLng: Double,
    val price: Double,
    val availableSeats: Int,
    val departureTime: String,
    val status: String,
    val driver: DriverDto? = null,
)

data class DriverDto(
    val id: String,
    val currentLat: Double? = null,
    val currentLng: Double? = null,
    val rating: Float = 5f,
    val user: UserDto? = null,
)

data class DriversResponse(val success: Boolean, val drivers: List<DriverDto>?)

data class BookingRequest(val rideId: String, val seats: Int = 1)

data class BookingResponse(
    val success: Boolean,
    val message: String? = null,
    val booking: BookingDto? = null,
    val bookings: List<BookingDto>? = null,
)

data class RideDetailResponse(val success: Boolean, val ride: RideDto? = null)

data class BecomeDriverResponse(val success: Boolean, val message: String? = null, val driver: DriverDto? = null)

data class BookingDto(
    val id: String,
    val rideId: String,
    val seats: Int,
    val status: String,
    val ride: RideDto? = null,
)

data class VehicleDto(
    val id: String,
    val brand: String,
    val model: String,
    val color: String,
    val plate: String,
    val seats: Int,
    val type: String,
    val isActive: Boolean = true,
)

data class VehiclesResponse(val success: Boolean, val vehicles: List<VehicleDto>?)

data class CreateVehicleRequest(
    val brand: String,
    val model: String,
    val color: String,
    val plate: String,
    val seats: Int,
    val type: String = "SEDAN",
)

data class SendMessageResponse(val success: Boolean, val message: MessageDto? = null)

data class CreateRideRequest(
    val departureLat: Double,
    val departureLng: Double,
    val arrivalLat: Double,
    val arrivalLng: Double,
    val departureAddress: String,
    val arrivalAddress: String,
    val departureTime: String,
    val price: Double,
    val availableSeats: Int,
    val vehicleId: String,
)

data class BecomeDriverRequest(
    val documents: Map<String, String> = emptyMap(),
    val brand: String? = null,
    val model: String? = null,
    val color: String? = null,
    val plate: String? = null,
    val seats: Int? = null,
    val type: String? = "SEDAN",
)

data class ChangePasswordRequest(val currentPassword: String, val newPassword: String)

data class ChangePasswordResponse(val success: Boolean, val message: String? = null)

data class UpdateProfileRequest(val name: String? = null, val email: String? = null)

data class FavoriteDto(
    val id: String,
    val type: String,
    val targetId: String? = null,
    val label: String? = null,
    val address: String? = null,
    val lat: Double? = null,
    val lng: Double? = null,
)

data class FavoriteRequest(
    val type: String,
    val label: String? = null,
    val address: String? = null,
    val lat: Double? = null,
    val lng: Double? = null,
    val targetId: String? = null,
)

data class FavoritesResponse(val success: Boolean, val favorites: List<FavoriteDto>? = null)

data class ReportRequest(val reportedId: String, val reason: String)

data class ReportCreateResponse(val success: Boolean, val report: ReportDto? = null)

data class GeocodeResponse(
    val success: Boolean,
    val lat: Double? = null,
    val lng: Double? = null,
    val formattedAddress: String? = null,
)

data class AutocompleteSuggestion(
    val description: String,
    val placeId: String? = null,
    val lat: Double? = null,
    val lng: Double? = null,
)

data class AutocompleteResponse(val success: Boolean, val suggestions: List<AutocompleteSuggestion>? = null)

data class ReverseGeocodeResponse(
    val success: Boolean,
    val lat: Double? = null,
    val lng: Double? = null,
    val formattedAddress: String? = null,
)

data class DirectionsResponse(
    val success: Boolean,
    val route: RouteDto? = null,
    val message: String? = null,
)

data class RouteDto(
    val distanceKm: Double,
    val durationMin: Int,
    val geometry: GeometryDto? = null,
    val polyline: String? = null,
)

data class GeometryDto(
    val coordinates: List<List<Double>>? = null,
)


data class ProfileResponse(val success: Boolean, val user: UserDto?)

data class MessageRequest(val receiverId: String, val content: String, val rideId: String? = null)

data class MessagesResponse(val success: Boolean, val messages: List<MessageDto>?)

data class MessageDto(
    val id: String,
    val content: String,
    val senderId: String,
    val receiverId: String,
    val createdAt: String,
    val isRead: Boolean,
)

data class FareEstimateResponse(
    val success: Boolean,
    val estimate: FareEstimateDto? = null,
    val message: String? = null,
)

data class FareEstimateDto(
    val distanceKm: Double,
    val price: Int,
    val durationMin: Int,
    val currency: String = "MGA",
)

data class AdminStatsResponse(
    val success: Boolean,
    val stats: AdminStatsDto? = null,
)

data class AdminStatsDto(
    val totalUsers: Int = 0,
    val totalDrivers: Int = 0,
    val approvedDrivers: Int = 0,
    val pendingDrivers: Int = 0,
    val totalRides: Int = 0,
    val activeRides: Int = 0,
    val totalBookings: Int = 0,
    val pendingReports: Int = 0,
    val totalRevenue: Double = 0.0,
)

data class AdminUsersResponse(
    val success: Boolean,
    val users: List<AdminUserDto>? = null,
)

data class AdminUserDto(
    val id: String,
    val name: String,
    val phone: String,
    val role: String,
    val isBlocked: Boolean = false,
    val rating: Float = 5f,
    val driver: AdminDriverBriefDto? = null,
)

data class AdminDriverBriefDto(
    val id: String,
    val isApproved: Boolean,
    val status: String,
)

data class PendingDriversResponse(
    val success: Boolean,
    val drivers: List<PendingDriverDto>? = null,
)

data class PendingDriverDto(
    val id: String,
    val userId: String,
    val isApproved: Boolean,
    val user: UserDto? = null,
)

data class AdminRidesMonitorResponse(
    val success: Boolean,
    val rides: List<RideDto>? = null,
)

data class AdminReportsResponse(
    val success: Boolean,
    val reports: List<ReportDto>? = null,
)

data class ReportDto(
    val id: String,
    val reason: String,
    val status: String,
    val createdAt: String,
    val reporter: UserDto? = null,
    val reported: UserDto? = null,
)

data class DriverStatusResponse(
    val success: Boolean,
    val driver: DriverStatusDto? = null,
)

data class DriverStatusDto(
    val status: String,
    val isApproved: Boolean = false,
)

data class DriverStatusRequest(val status: String)

data class DriverEarningsResponse(
    val success: Boolean,
    val earnings: DriverEarningsDto? = null,
    val pendingRides: List<RideDto>? = null,
)

data class DriverEarningsDto(
    val totalRevenue: Double = 0.0,
    val completedRides: Int = 0,
    val todayTrips: Int = 0,
)

data class ReviewRequest(
    val reviewedId: String,
    val rating: Int,
    val comment: String? = null,
    val rideId: String? = null,
)

data class ReviewResponse(val success: Boolean, val message: String? = null)

data class CreateRideRequestBody(
    val pickupLat: Double,
    val pickupLng: Double,
    val pickupAddress: String,
    val dropoffLat: Double,
    val dropoffLng: Double,
    val dropoffAddress: String,
    val vehicleType: String = "SEDAN",
    val scheduledAt: String? = null,
    val couponCode: String? = null,
)

data class RideRequestDto(
    val id: String,
    val pickupAddress: String,
    val dropoffAddress: String,
    val pickupLat: Double,
    val pickupLng: Double,
    val dropoffLat: Double,
    val dropoffLng: Double,
    val vehicleType: String,
    val estimatedPrice: Double,
    val finalPrice: Double? = null,
    val status: String,
    val passenger: UserDto? = null,
    val driver: DriverDto? = null,
)

data class RideRequestResponse(
    val success: Boolean,
    val rideRequest: RideRequestDto? = null,
    val message: String? = null,
)

data class RideRequestsResponse(
    val success: Boolean,
    val rideRequests: List<RideRequestDto>? = null,
)

data class PaymentInitRequest(
    val rideRequestId: String? = null,
    val bookingId: String? = null,
    val method: String = "CASH",
    val phone: String? = null,
)

data class PaymentConfirmRequest(
    val rideRequestId: String? = null,
    val bookingId: String? = null,
)

data class PaymentDto(
    val id: String,
    val amount: Double,
    val method: String,
    val status: String,
    val rideRequestId: String? = null,
    val bookingId: String? = null,
)

data class PaymentResponse(
    val success: Boolean,
    val payment: PaymentDto? = null,
    val message: String? = null,
    val instructions: String? = null,
    val transactionRef: String? = null,
)

data class PaymentsHistoryResponse(
    val success: Boolean,
    val payments: List<PaymentDto>? = null,
)

data class DriverRideHistoryResponse(
    val success: Boolean,
    val rideRequests: List<RideRequestDto>? = null,
    val sharedRides: List<RideDto>? = null,
)
