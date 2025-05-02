package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_pauses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectPause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Le projet mis en pause
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    // Le superviseur qui demande la pause
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id", nullable = false)
    private User supervisor;

    // Raison textuelle de la pause
    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    // Date de la demande de pause
    @Column(name = "paused_at", nullable = false)
    private LocalDateTime pausedAt = LocalDateTime.now();

    // Si vous voulez gérer des pièces jointes
    @OneToMany(mappedBy = "pause", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PauseAttachment> attachments = new ArrayList<>();
}