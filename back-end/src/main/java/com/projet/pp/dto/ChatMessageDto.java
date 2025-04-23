// ChatMessageDto.java
package com.projet.pp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatMessageDto {
    private Long id;
    private String message;
    private String createdAt; // ou LocalDateTime et Jackson le formatera
    private SenderDto sender;

    @Data
    @AllArgsConstructor
    public static class SenderDto {
        private Long id;
        private String prenom;
        private String nom;
    }
}
