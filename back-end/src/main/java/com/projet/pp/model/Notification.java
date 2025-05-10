package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})

public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The recipient of the notification (admin, dev, or tester)
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "recipient_role", nullable = false)
    private RoleType recipientRole;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "related_project_id")
    private Project relatedProject;

    @ManyToOne
    @JoinColumn(name = "related_task_id")
    private Tache relatedTask;

    @ManyToOne
    @JoinColumn(name = "chat_message_id")
    private ChatMessage chatMessage;
    @ManyToOne
    @JoinColumn(name = "meeting_id")
    private Meeting meeting;

    public enum RoleType {
        admin, dev, tester
    }
}
