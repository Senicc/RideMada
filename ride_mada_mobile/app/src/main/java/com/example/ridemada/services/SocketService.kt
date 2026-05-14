package com.ridemada.services

import io.socket.client.IO
import io.socket.client.Socket
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SocketService @Inject constructor() {

    private var socket: Socket? = null
    private var token: String? = null

    fun initialize(baseUrl: String = "http://10.0.2.2:5000") {
        val options = IO.Options().apply {
            reconnection = true
            reconnectionDelay = 1000
            timeout = 20000
        }
        socket = IO.socket(baseUrl, options)
    }

    fun connect(authToken: String) {
        this.token = authToken
        socket?.io()?.options?.auth = mapOf("token" to authToken)
        socket?.connect()
    }

    fun updateLocation(lat: Double, lng: Double, rideId: String? = null) {
        val data = JSONObject().apply {
            put("lat", lat)
            put("lng", lng)
            if (rideId != null) put("rideId", rideId)
        }
        socket?.emit("updateDriverLocation", data)
    }

    fun sendMessage(receiverId: String, content: String, rideId: String? = null) {
        val data = JSONObject().apply {
            put("receiverId", receiverId)
            put("content", content)
            if (rideId != null) put("rideId", rideId)
        }
        socket?.emit("sendMessage", data)
    }

    fun disconnect() {
        socket?.disconnect()
    }

    fun setOnLocationUpdate(listener: (JSONObject) -> Unit) {
        socket?.on("driverLocationUpdate") { args ->
            if (args.isNotEmpty()) listener(args[0] as JSONObject)
        }
    }
}