package com.projet.pp.model;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "test_level_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TestLevelProgress {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne @JoinColumn(name="project_id", nullable=false)
    private Project project;

    @ManyToOne @JoinColumn(name="tester_id", nullable=false)
    private User tester;

    @Column(nullable=false)
    private String level; // nom du niveau

    @Column(nullable=false)
    private boolean completed;

    private LocalDateTime completedAt;
}
