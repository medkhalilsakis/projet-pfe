// src/main/java/com/projet/pp/dto/ChatMessageDTO.java
package com.projet.pp.dto;

import com.projet.pp.model.ChatAttachment;
import com.projet.pp.model.ChatMessage;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
@Builder
public class ChatMessageDTO {

    private Long       id;
    private String     message;
    private LocalDateTime createdAt;
    private SenderDTO  sender;
    private ReceiverDTO receiver;
    private List<AttachmentDTO> attachments;

    /** Conversion d’entité vers DTO pour REST/WebSocket */
    public static ChatMessageDTO fromEntity(ChatMessage m) {
        return ChatMessageDTO.builder()
                .id(m.getId())
                .message(m.getMessage())
                .createdAt(m.getCreatedAt())
                .sender(new SenderDTO(
                        m.getSender().getId(),
                        m.getSender().getPrenom(),
                        m.getSender().getNom()
                ))
                .receiver(new ReceiverDTO(
                        m.getReceiver().getId(),
                        m.getReceiver().getPrenom(),
                        m.getReceiver().getNom()
                ))
                .attachments(
                        m.getAttachments().stream()
                                .map(a -> new AttachmentDTO(
                                        a.getFileName(),
                                        a.getFilePath(),
                                        a.getMimeType()
                                ))
                                .collect(Collectors.toList())
                )
                .build();
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class SenderDTO {
        private Long   id;
        private String prenom;
        private String nom;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class ReceiverDTO {
        private Long   id;
        private String prenom;
        private String nom;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AttachmentDTO {
        private String fileName;
        private String filePath;
        private String mimeType;
    }
}
