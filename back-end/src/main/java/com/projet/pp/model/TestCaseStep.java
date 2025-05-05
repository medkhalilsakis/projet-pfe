package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class TestCaseStep {
    @Id @GeneratedValue
    private Long id;
    @Column(columnDefinition="TEXT") private String stepDesc, action, expected, comment;
    private boolean success;

    // dans TestCaseStep.java
    @ManyToOne
    @JoinColumn(name="test_case_id")
    @JsonIgnore  // on n’a pas besoin de sérialiser le testCase ici
    private TestCase testCase;

}