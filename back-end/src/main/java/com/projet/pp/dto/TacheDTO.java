// src/main/java/com/projet/pp/dto/TacheDTO.java
package com.projet.pp.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TacheDTO {
    private Long id;
    private String name;

    // résumé (list) : ces champs restent à null
    private String description;
    private String outils;

    private String status;
    private LocalDate deadline;

    /** Sera sérialisé sous la propriété "publishedAt" */
    @JsonProperty("publishedAt")
    private LocalDate creationDate;

    /** Toujours présent, même en résumé */
    private List<SimpleUser> assignedTo;

    /** Présent uniquement en détail */
    private List<AttachmentDTO> attachments;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SimpleUser {
        private Long id;
        private String prenom;
        private String nom;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AttachmentDTO {
        private Long id;
        private String fileName;
        private String fileType;
    }
}
