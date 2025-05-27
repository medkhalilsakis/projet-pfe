package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "test_case_step")
public class TestCaseStep {
    @Id @GeneratedValue
    private Long id;

    @Column(columnDefinition="TEXT") private String stepDesc, action, expected, comment;
    private boolean success;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_case_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "steps"})
    private TestCase testCase;
}