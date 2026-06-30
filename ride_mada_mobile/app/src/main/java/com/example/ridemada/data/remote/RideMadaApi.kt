package com.ridemada.data.remote

import com.ridemada.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

interface RideMadaApi {

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<AuthResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body request: OtpRequest): Response<AuthResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<AuthResponse>

    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<AuthResponse>

    @POST("auth/refresh")
    suspend fun refreshToken(@Body body: Map<String, String>): Response<AuthResponse>

    @GET("users/profile")
    suspend fun getProfile(): Response<ProfileResponse>

    @PUT("users/profile")
    suspend fun updateProfile(@Body request: UpdateProfileRequest): Response<ProfileResponse>

    @GET("users/favorites")
    suspend fun getFavorites(): Response<FavoritesResponse>

    @POST("users/favorites")
    suspend fun addFavorite(@Body request: FavoriteRequest): Response<FavoritesResponse>

    @DELETE("users/favorites/{id}")
    suspend fun deleteFavorite(@Path("id") id: String): Response<FavoritesResponse>

    @GET("maps/geocode")
    suspend fun geocode(@Query("address") address: String): Response<GeocodeResponse>

    @GET("maps/autocomplete")
    suspend fun autocomplete(@Query("input") input: String): Response<AutocompleteResponse>

    @GET("maps/reverse")
    suspend fun reverseGeocode(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
    ): Response<ReverseGeocodeResponse>

    @GET("maps/directions")
    suspend fun getDirections(
        @Query("originLat") originLat: Double,
        @Query("originLng") originLng: Double,
        @Query("destLat") destLat: Double,
        @Query("destLng") destLng: Double,
    ): Response<DirectionsResponse>

    @POST("reports")
    suspend fun createReport(@Body request: ReportRequest): Response<ReportCreateResponse>

    @PUT("users/change-password")
    suspend fun changePassword(@Body request: ChangePasswordRequest): Response<ChangePasswordResponse>

    @PATCH("users/fcm-token")
    suspend fun updateFcmToken(@Body request: FcmTokenRequest): Response<AuthResponse>

    @GET("rides/nearby")
    suspend fun getNearbyRides(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
    ): Response<RidesResponse>

    @GET("rides/nearby-drivers")
    suspend fun getNearbyDrivers(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
    ): Response<DriversResponse>

    @GET("rides/{id}")
    suspend fun getRide(@Path("id") id: String): Response<RideDetailResponse>

    @POST("rides")
    suspend fun createRide(@Body request: CreateRideRequest): Response<RideDetailResponse>

    @POST("bookings")
    suspend fun createBooking(@Body request: BookingRequest): Response<BookingResponse>

    @GET("bookings/my-bookings")
    suspend fun getMyBookings(): Response<BookingResponse>

    @POST("drivers/become-driver")
    suspend fun becomeDriver(@Body request: BecomeDriverRequest): Response<BecomeDriverResponse>

    @GET("vehicles/my-vehicles")
    suspend fun getMyVehicles(): Response<VehiclesResponse>

    @POST("vehicles")
    suspend fun addVehicle(@Body request: CreateVehicleRequest): Response<VehiclesResponse>

    @GET("messages/chat/{userId}")
    suspend fun getChat(@Path("userId") userId: String): Response<MessagesResponse>

    @POST("messages")
    suspend fun sendMessage(@Body request: MessageRequest): Response<SendMessageResponse>

    @GET("rides/estimate-fare")
    suspend fun estimateFare(
        @Query("departureLat") departureLat: Double,
        @Query("departureLng") departureLng: Double,
        @Query("arrivalLat") arrivalLat: Double,
        @Query("arrivalLng") arrivalLng: Double,
        @Query("vehicleType") vehicleType: String = "SEDAN",
    ): Response<FareEstimateResponse>

    @GET("drivers/status")
    suspend fun getDriverStatus(): Response<DriverStatusResponse>

    @PUT("drivers/status")
    suspend fun updateDriverStatus(@Body request: DriverStatusRequest): Response<DriverStatusResponse>

    @GET("drivers/earnings")
    suspend fun getDriverEarnings(): Response<DriverEarningsResponse>

    @GET("admin/statistics")
    suspend fun getAdminStatistics(): Response<AdminStatsResponse>

    @GET("admin/users")
    suspend fun getAdminUsers(): Response<AdminUsersResponse>

    @GET("admin/drivers/pending")
    suspend fun getPendingDrivers(): Response<PendingDriversResponse>

    @PUT("admin/drivers/{id}/approve")
    suspend fun approveDriver(@Path("id") id: String): Response<BecomeDriverResponse>

    @GET("admin/rides/active")
    suspend fun getActiveRides(): Response<AdminRidesMonitorResponse>

    @GET("admin/reports")
    suspend fun getReports(): Response<AdminReportsResponse>

    @POST("admin/block-user/{id}")
    suspend fun blockUser(@Path("id") id: String): Response<AuthResponse>

    @POST("admin/unblock-user/{id}")
    suspend fun unblockUser(@Path("id") id: String): Response<AuthResponse>

    @POST("reviews")
    suspend fun submitReview(@Body request: ReviewRequest): Response<ReviewResponse>

    @POST("ride-requests")
    suspend fun createRideRequest(@Body request: CreateRideRequestBody): Response<RideRequestResponse>

    @GET("ride-requests/my")
    suspend fun getMyRideRequests(): Response<RideRequestsResponse>

    @GET("ride-requests/pending")
    suspend fun getPendingRideRequests(
        @Query("lat") lat: Double? = null,
        @Query("lng") lng: Double? = null,
    ): Response<RideRequestsResponse>

    @GET("ride-requests/{id}")
    suspend fun getRideRequest(@Path("id") id: String): Response<RideRequestResponse>

    @PUT("ride-requests/{id}/accept")
    suspend fun acceptRideRequest(@Path("id") id: String): Response<RideRequestResponse>

    @PUT("ride-requests/{id}/arriving")
    suspend fun driverArriving(@Path("id") id: String): Response<RideRequestResponse>

    @PUT("ride-requests/{id}/start")
    suspend fun startRideRequest(@Path("id") id: String): Response<RideRequestResponse>

    @PUT("ride-requests/{id}/complete")
    suspend fun completeRideRequest(@Path("id") id: String): Response<RideRequestResponse>

    @PUT("ride-requests/{id}/cancel")
    suspend fun cancelRideRequest(@Path("id") id: String): Response<RideRequestResponse>

    @GET("ride-requests/driver/active")
    suspend fun getDriverActiveRide(): Response<RideRequestResponse>

    @GET("ride-requests/driver/history")
    suspend fun getDriverRideHistory(): Response<DriverRideHistoryResponse>

    @POST("payments/initiate")
    suspend fun initiatePayment(@Body request: PaymentInitRequest): Response<PaymentResponse>

    @POST("payments/confirm-cash")
    suspend fun confirmCashPayment(@Body request: PaymentConfirmRequest): Response<PaymentResponse>

    @GET("payments/history")
    suspend fun getPaymentHistory(): Response<PaymentsHistoryResponse>

    @GET("payments/{id}/status")
    suspend fun getPaymentStatus(@Path("id") id: String): Response<PaymentResponse>
}
