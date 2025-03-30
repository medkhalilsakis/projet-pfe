package com.projet.pp.service;

import com.projet.pp.model.Conversation;
import com.projet.pp.model.Message;
import com.projet.pp.model.User;
import com.projet.pp.repository.ConversationRepository;
import com.projet.pp.repository.MessageRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;


    public ChatService(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    public List<Conversation> getConversationsByUser(Long userId) {
        return conversationRepository.findByUserId(userId);
    }

    public List<Message> getMessagesByConversation(Long conversationId) {
        return messageRepository.findByConversationId(conversationId);
    }



    public Message sendMessage(Long conversationId, Long senderId, String content) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation non trouvée"));
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Message message = new Message();
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setContent(content);
        message.setIsRead(false);
        message.setCreatedAt(LocalDateTime.now());

        return messageRepository.save(message);
    }

    public void markMessagesAsRead(Long conversationId, Long userId) {
        messageRepository.markAsRead(conversationId, userId);
    }

    public Conversation startConversation(Long user1Id, Long user2Id) {
        Long existingConvId = conversationRepository.findExistingConversation(user1Id, user2Id);
        if (existingConvId != null) {
            return conversationRepository.findById(existingConvId)
                    .orElseThrow(() -> new RuntimeException("Conversation introuvable"));
        }
        User user1 = userRepository.findById(user1Id)
                .orElseThrow(() -> new RuntimeException("Utilisateur 1 non trouvé"));
        User user2 = userRepository.findById(user2Id)
                .orElseThrow(() -> new RuntimeException("Utilisateur 2 non trouvé"));
        Conversation conversation = new Conversation();
        conversation.setUser1(user1);
        conversation.setUser2(user2);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversationRepository.save(conversation);
    }

}
