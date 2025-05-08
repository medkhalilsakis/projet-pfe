package com.projet.pp.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectChatMessageDTO {

    private Long id;
    private String message;
    private String createdAt;  // Date au format ISO
    private SenderDTO sender;
    private List<AttachmentDTO> attachments;

    // Rendre cette classe publique
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SenderDTO {
        private Long id;
        private String prenom;
        private String nom;
    }

    // Rendre cette classe publique aussi
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class AttachmentDTO {
        private Long id;
        private String fileName;
        private String mimeType;
    }
}
