package com.projet.pp.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


@Entity
@Table(name = "pause_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class PauseRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false)
    private Long requesterId;

    @Column(nullable = false)
    private String reason;

    @Enumerated(EnumType.STRING)
    private PauseStatus status ; // PENDING, APPROVED, REJECTED

    @Column(updatable = false)
    private LocalDateTime requestedAt = LocalDateTime.now();

    @Column
    private Long supervisorId;

    @Column
    private LocalDateTime handledAt;
}

