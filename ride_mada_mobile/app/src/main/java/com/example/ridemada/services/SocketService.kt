package com.ridemada.services

import com.ridemada.BuildConfig
import com.ridemada.data.remote.dto.RideRequestDto
import com.google.gson.Gson
import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SocketService @Inject constructor() {

    private var socket: Socket? = null
    private var connectedToken: String? = null
    private val gson = Gson()

    @Synchronized
    fun connect(authToken: String, baseUrl: String = BuildConfig.SOCKET_URL) {
        if (authToken.isBlank()) return

        if (connectedToken == authToken && socket?.connected() == true) return

        disconnect()

        val options = IO.Options().apply {
            reconnection = true
            reconnectionDelay = 1000
            timeout = 20000
            auth = mapOf("token" to authToken)
        }
        socket = IO.socket(baseUrl, options)
        connectedToken = authToken
        socket?.connect()
    }

    fun updateLocation(lat: Double, lng: Double, rideId: String? = null) {
        if (socket?.connected() != true) return
        val data = JSONObject().apply {
            put("lat", lat)
            put("lng", lng)
            if (rideId != null) put("rideId", rideId)
        }
        socket?.emit("updateDriverLocation", data)
    }

    fun sendMessage(receiverId: String, content: String, rideId: String? = null) {
        if (socket?.connected() != true) return
        val data = JSONObject().apply {
            put("receiverId", receiverId)
            put("content", content)
            if (rideId != null) put("rideId", rideId)
        }
        socket?.emit("sendMessage", data)
    }

    fun joinRideRoom(rideId: String) {
        socket?.emit("joinRideRoom", rideId)
    }

    fun joinRideRequestRoom(rideRequestId: String) {
        socket?.emit("joinRideRequestRoom", rideRequestId)
    }

    @Synchronized
    fun disconnect() {
        socket?.off()
        socket?.disconnect()
        socket = null
        connectedToken = null
    }

    fun setOnLocationUpdate(listener: (JSONObject) -> Unit) {
        socket?.off("driverLocationUpdate")
        socket?.on("driverLocationUpdate") { args ->
            if (args.isNotEmpty()) listener(args[0] as JSONObject)
        }
    }

    fun setOnNewMessage(listener: (JSONObject) -> Unit) {
        socket?.off("newMessage")
        socket?.on("newMessage") { args ->
            if (args.isNotEmpty()) listener(args[0] as JSONObject)
        }
    }

    fun setOnRideRequestAccepted(listener: (RideRequestDto) -> Unit) {
        socket?.off("rideRequestAccepted")
        socket?.on("rideRequestAccepted") { args ->
            if (args.isEmpty()) return@on
            val json = args[0].toString()
            runCatching { gson.fromJson(json, RideRequestDto::class.java) }
                .onSuccess(listener)
        }
    }

    fun setOnNewRideRequest(listener: (RideRequestDto) -> Unit) {
        socket?.off("newRideRequest")
        socket?.on("newRideRequest") { args ->
            if (args.isEmpty()) return@on
            val json = args[0].toString()
            runCatching { gson.fromJson(json, RideRequestDto::class.java) }
                .onSuccess(listener)
        }
    }

    fun setOnRideRequestStatusUpdate(listener: (JSONObject) -> Unit) {
        socket?.off("rideRequestStatusUpdate")
        socket?.on("rideRequestStatusUpdate") { args ->
            if (args.isNotEmpty()) listener(args[0] as JSONObject)
        }
    }

    fun isConnected(): Boolean = socket?.connected() == true
}
