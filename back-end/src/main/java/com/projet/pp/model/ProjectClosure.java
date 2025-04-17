package com.projet.pp.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_closure")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectClosure {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="project_id", nullable=false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="supervisor_id", nullable=false)
    private User supervisor;

    @Column(columnDefinition="TEXT", nullable=false)
    private String reason;

    @CreationTimestamp
    @Column(name="closed_at", updatable=false)
    private LocalDateTime closedAt;

    // getters/setters…
}
