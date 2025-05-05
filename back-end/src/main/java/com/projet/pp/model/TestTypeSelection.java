package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "test_type_selections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TestTypeSelection {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne @JoinColumn(name="project_id", nullable=false)
    private Project project;

    @ManyToOne @JoinColumn(name="tester_id", nullable=false)
    private User tester;

    @Column(nullable=false)
    private String testType; // nom du type: "Test unitaire", etc.

    @CreationTimestamp
    private LocalDateTime selectedAt;
}
