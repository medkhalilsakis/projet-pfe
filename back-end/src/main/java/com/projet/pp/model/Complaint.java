package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Complaint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "project_id", nullable = false)
    private Long projectId;

    @Column(name = "superviser_id", nullable = false)
    private Long superviserId;

    @Column(name = "complainer_id", nullable = false)
    private Long complainerId;

    @Column(nullable = false)
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(nullable = false)
    private LocalDateTime date;

    public Complaint(Long projectId, Long superviserId, Long complainerId, String reason, String details) {
        this.projectId = projectId;
        this.superviserId = superviserId;
        this.complainerId = complainerId;
        this.reason = reason;
        this.details = details;
        this.date = LocalDateTime.now();
    }
}
