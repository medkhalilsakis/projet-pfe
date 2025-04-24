package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_invited_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectInvitedUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String status; // "pending", "accepted", "rejected"

    @Column(name = "invited_at")
    private LocalDateTime invitedAt;
}
