package com.projet.pp.model;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "test_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TestResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "assignment_id", nullable = false)
    private ProjectTesterAssignment assignment;

    @Enumerated(EnumType.STRING)
    @Column(name = "test_outcome", nullable = false)
    private TestOutcome testOutcome;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "bug_category")
    private String bugCategory;

}