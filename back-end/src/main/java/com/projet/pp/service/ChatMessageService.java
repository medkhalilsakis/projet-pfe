package com.projet.pp.service;

import com.projet.pp.model.ChatMessage;
import com.projet.pp.model.User;

import com.projet.pp.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    // Save a message
    public ChatMessage saveMessage(ChatMessage chatMessage) {
        return chatMessageRepository.save(chatMessage);
    }

    // Send a message (this method was missing in your service)
    public ChatMessage sendMessage(User receiver, User sender, String message, LocalDateTime createdAt) {
        ChatMessage chatMessage = new ChatMessage();
        chatMessage.setSender(sender);
        chatMessage.setReceiver(receiver);
        chatMessage.setMessage(message);
        chatMessage.setCreatedAt(createdAt);
        return saveMessage(chatMessage); // Save the chat message to the repository
    }

    // Retrieve chat history between two users
    public List<ChatMessage> getChatHistory(Long receiverId, Long senderId) {
        return chatMessageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
    }
}