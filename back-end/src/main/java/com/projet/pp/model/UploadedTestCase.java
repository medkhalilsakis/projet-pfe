package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "uploaded_test_cases")
public class UploadedTestCase {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    // on ignore tout ce qui peut générer un proxy vide
    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler",
            "assignments",
            "files",
            "invitedUsers",
            "user"         // selon ce que vous ne voulez pas exposer
    })
    private Project project;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "file_path", nullable = false)
    private String filePath;

    @Column(name = "mime_type")
    private String mimeType;

    @Column(name = "uploaded_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime uploadedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    // idem pour l’uploader
    @JsonIgnoreProperties({
            "hibernateLazyInitializer",
            "handler",
            "projects",         // tout ce qui ramène à du JPA
            "assignments",
            "password",         // si présent
            "roles"
    })
    private User uploader;

}