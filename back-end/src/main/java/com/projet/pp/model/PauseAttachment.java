package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pause_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PauseAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vers quelle pause
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pause_id", nullable = false)
    private ProjectPause pause;

    // Nom original du fichier
    @Column(nullable = false)
    private String filename;

    // Chemin sur le disque ou URL
    @Column(nullable = false)
    private String path;
}