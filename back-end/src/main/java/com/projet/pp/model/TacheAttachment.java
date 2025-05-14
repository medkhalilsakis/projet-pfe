// src/main/java/com/projet/pp/model/TacheAttachment.java
package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tache_attachments")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @ToString
public class TacheAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nom du fichier (original)
    private String fileName;

    // Chemin sur le disque ou URL
    private String filePath;

    // Mime-type (application/pdf, image/png…)
    private String fileType;

    // Taille en octets (optionnel)
    private Long fileSize;

    // Relation Many-to-One vers Tache
    @ManyToOne
    @JoinColumn(name = "tache_id", nullable = false)
    @JsonBackReference
    private Tache tache;
}
