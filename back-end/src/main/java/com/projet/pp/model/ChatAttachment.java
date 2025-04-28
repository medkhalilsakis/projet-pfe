// src/main/java/com/projet/pp/model/ChatAttachment.java
package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="chat_attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ChatAttachment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String filePath;
    private String mimeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="message_id")
    @JsonIgnoreProperties("attachments")
    private ChatMessage chatMessage;
}
