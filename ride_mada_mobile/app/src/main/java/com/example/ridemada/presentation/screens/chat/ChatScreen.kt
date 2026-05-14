package com.ridemada.presentation.screens.chat

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.ridemada.presentation.viewmodel.ChatViewModel

@Composable
fun ChatScreen(
    rideId: String,
    receiverId: String,
    viewModel: ChatViewModel = hiltViewModel()
) {
    val messages by viewModel.messages.collectAsState()
    var messageText by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize()) {
        // Header
        TopAppBar(title = { Text("Chat avec le conducteur") })

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .padding(16.dp),
            reverseLayout = true
        ) {
            items(messages.reversed()) { msg ->
                ChatBubble(
                    message = msg.content,
                    isFromMe = msg.isFromCurrentUser
                )
            }
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = messageText,
                onValueChange = { messageText = it },
                modifier = Modifier.weight(1f),
                placeholder = { Text("Écrire un message...") }
            )
            IconButton(onClick = {
                if (messageText.isNotBlank()) {
                    viewModel.sendMessage(receiverId, messageText, rideId)
                    messageText = ""
                }
            }) {
                Icon(Icons.Default.Send, contentDescription = "Envoyer")
            }
        }
    }
}