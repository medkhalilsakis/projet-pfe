package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne @JoinColumn(name="user_id", nullable=false)
    private User recipient;

    private String type;      // "TASK_ASSIGNED", "PROJECT_LINKED", "NEW_MESSAGE", …
    private String payload;   // JSON ou texte libre à afficher
    private boolean read = false;

    @CreationTimestamp
    private LocalDateTime createdAt;

    // getters/setters, constructeur…
}
