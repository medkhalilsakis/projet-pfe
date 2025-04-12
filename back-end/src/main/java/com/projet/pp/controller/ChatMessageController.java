package com.projet.pp.controller;

import com.projet.pp.model.User;
import com.projet.pp.model.ChatMessage;
import com.projet.pp.service.ChatMessageService;
import com.projet.pp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/chat")
public class ChatMessageController {

    @Autowired
    private ChatMessageService chatMessageService;
    @Autowired
    private UserService userService;


    // Store a chat message
    @PostMapping("/send")
    public ResponseEntity<ChatMessage> sendMessage(
            @RequestBody Map<String, String> body) {

        try {
            String message = body.get("message");

            Long senderId = Long.parseLong(body.get("senderId"));
            Long receiverId = Long.parseLong(body.get("receiverId"));LocalDateTime createdAt = LocalDateTime.now(); // Or parse from body if needed
            User receiver =userService.getUserById(receiverId);
            User sender =userService.getUserById(senderId);            // Use the service method to send the message
            ChatMessage chatMessage = chatMessageService.sendMessage(receiver, sender, message, createdAt);
            return ResponseEntity.ok(chatMessage);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @GetMapping("/history/{senderId}/{receiverId}")
    public ResponseEntity<List<ChatMessage>> getChatHistory(@PathVariable Long senderId, @PathVariable Long receiverId) {
        User receiver = userService.getUserById(receiverId);
        User sender = userService.getUserById(senderId);
        System.out.println("receiver.username");



        List<ChatMessage> messages = chatMessageService.getChatHistory(senderId, receiverId);
        System.out.println(messages);
        return ResponseEntity.ok(messages);
    }

    // Retrieve chat history between two users

}