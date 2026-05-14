package com.ridemada.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.ridemada.MainActivity
import com.ridemada.R

class FirebaseMessagingService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Envoyer le token au backend
        sendTokenToBackend(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        val title = remoteMessage.notification?.title ?: "RideMada"
        val body = remoteMessage.notification?.body ?: ""
        val data = remoteMessage.data

        showNotification(title, body, data)
    }

    private fun sendTokenToBackend(token: String) {
        // TODO: Appeler ton AuthRepository ou UserRepository pour mettre à jour le token
        // Exemple : viewModel.updateFcmToken(token)
        println("📱 Nouveau FCM Token: $token")
    }

    private fun showNotification(title: String, body: String, data: Map<String, String>) {
        val channelId = "ridemada_notifications"
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as NotificationManager

        // Création du canal (Android 8+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "RideMada Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications pour trajets, messages et réservations"
            }
            notificationManager.createNotificationChannel(channel)
        }

        // Intent pour ouvrir l'application
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("notification_type", data["type"])
            putExtra("rideId", data["rideId"])
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(System.currentTimeMillis().toInt(), notification)
    }
}