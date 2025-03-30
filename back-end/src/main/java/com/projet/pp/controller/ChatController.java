package com.projet.pp.controller;

import com.projet.pp.model.Conversation;
import com.projet.pp.model.Message;
import com.projet.pp.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @GetMapping
    public ResponseEntity<List<?>> getConversations(@RequestParam("userId") Long userId) {
        List<?> convs = chatService.getConversationsByUser(userId);
        return ResponseEntity.ok(convs);
    }

    // Récupérer les messages d'une conversation
    @GetMapping("/{conversationId}/messages")
    public ResponseEntity<List<?>> getMessages(@PathVariable Long conversationId) {
        List<?> messages = chatService.getMessagesByConversation(conversationId);
        return ResponseEntity.ok(messages);
    }

    // Envoyer un message (via WebSocket pour le temps réel ou via REST)
    // Ici, pour simplifier, nous utilisons un endpoint REST
    @PostMapping("/sendMessage")
    public ResponseEntity<Message> sendMessage(@RequestBody Map<String, String> messageData) {
        Long conversationId = Long.parseLong(messageData.get("conversationId"));
        Long senderId = Long.parseLong(messageData.get("senderId"));
        String content = messageData.get("content");
        Message message = chatService.sendMessage(conversationId, senderId, content);
        return ResponseEntity.ok(message);
    }

    @PostMapping("/startConversation")
    public ResponseEntity<Conversation> startConversation(@RequestBody Map<String, Long> payload) {
        Long user1Id = payload.get("user1Id");
        Long user2Id = payload.get("user2Id");
        Conversation conversation = chatService.startConversation(user1Id, user2Id);
        return ResponseEntity.ok(conversation);
    }

    // Marquer les messages comme lus
    @PostMapping("/{conversationId}/markAsRead")
    public ResponseEntity<?> markAsRead(@PathVariable Long conversationId, @RequestParam("userId") Long userId) {
        chatService.markMessagesAsRead(conversationId, userId);
        return ResponseEntity.ok("Messages marqués comme lus");
    }
}
