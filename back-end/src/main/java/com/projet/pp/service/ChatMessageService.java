// src/main/java/com/projet/pp/service/ChatMessageService.java
package com.projet.pp.service;

import com.projet.pp.model.ChatAttachment;
import com.projet.pp.model.ChatMessage;
import com.projet.pp.model.User;
import com.projet.pp.repository.ChatAttachmentRepository;
import com.projet.pp.repository.ChatMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ChatMessageService {

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private ChatAttachmentRepository attachmentRepository;

    private final Path baseStorage = Paths.get("uploads/chat").toAbsolutePath().normalize();

    /**
     * Envoie et sauvegarde un message avec pièces jointes.
     * Les attachments sont rendus sous forme d'URL absolues.
     */
    @Transactional
    public ChatMessage sendMessage(User sender,
                                   User receiver,
                                   String message,
                                   boolean isRead,
                                   LocalDateTime createdAt,
                                   MultipartFile[] attachments) throws IOException {
        // (1) Créer et sauver le message
        ChatMessage chat = new ChatMessage(sender, receiver, message,isRead, createdAt);
        chat = chatMessageRepository.save(chat);

        // (2) Créer dossier uploads/chat/{messageId}
        Path messageDir = baseStorage.resolve(String.valueOf(chat.getId()));
        Files.createDirectories(messageDir);

        // (3) Traiter chaque fichier envoyé
        if (attachments != null) {
            for (MultipartFile file : attachments) {
                String originalName = file.getOriginalFilename();
                String storedName   = UUID.randomUUID() + "_" + originalName;
                Path target         = messageDir.resolve(storedName);
                file.transferTo(target.toFile());

                // Recadrage auto si c'est une image JPEG/PNG
                String mime = file.getContentType();
                if (mime != null && mime.startsWith("image/")) {
                    BufferedImage img = ImageIO.read(target.toFile());
                    int size = Math.min(img.getWidth(), img.getHeight());
                    BufferedImage crop = img.getSubimage(
                            (img.getWidth() - size) / 2,
                            (img.getHeight() - size) / 2,
                            size, size
                    );
                    ImageIO.write(crop, "png", target.toFile());
                    mime = "image/png";
                }

                // Construire l'URL absolue
                String relativePath = "/uploads/chat/" + chat.getId() + "/" + storedName;
                String absoluteUrl = ServletUriComponentsBuilder
                        .fromCurrentContextPath()
                        .path(relativePath)
                        .toUriString();

                ChatAttachment att = new ChatAttachment();
                att.setChatMessage(chat);
                att.setFileName(originalName);
                att.setFilePath(absoluteUrl);
                att.setMimeType(mime);
                attachmentRepository.save(att);
                chat.getAttachments().add(att);
            }
        }

        return chat;
    }
    public int countUnreadMessagesBetweenUsers(Long receiverId, @PathVariable Long senderId) {
        return chatMessageRepository.countByReceiverIdAndSenderIdAndIsReadFalse(receiverId,senderId);
    }

    /** Récupère l’historique entre deux utilisateurs */
    public List<ChatMessage> getChatHistory(Long senderId, Long receiverId) {
        return chatMessageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
    }
    public List<ChatMessage> markAllMessagesAsRead(Long senderId, Long receiverId) {
        // Now senderId = selected user, receiverId = current user
        System.out.println("marking all messages as read");
        List<ChatMessage> unreadMessages = chatMessageRepository
                .findBySenderIdAndReceiverId(senderId, receiverId);
        System.out.println("unread messages: " + unreadMessages.size());

        for (ChatMessage msg : unreadMessages) {
            msg.setIsRead(true);
            chatMessageRepository.save(msg);

        }
        return chatMessageRepository.findBySenderIdAndReceiverId(senderId, receiverId);
    }
    @Transactional
    public void deleteChatMessagesbyUserId(Long userId) {
        // This will delete all ChatMessage rows with sender_id = userId AND receiver_id = userId
        chatMessageRepository.deleteBySenderId(userId);
        chatMessageRepository.deleteByReceiverId(userId);
    }

}
