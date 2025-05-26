// TestStep.java
package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "test_scenario_steps")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TestScenarioStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String expected;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scenario_id", nullable = false)
    private TestScenario scenario;
}
