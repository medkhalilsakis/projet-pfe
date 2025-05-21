package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_cases_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString

public class TestAssignmentAttachment {


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


}

