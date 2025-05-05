package com.projet.pp.model;

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
    @ManyToOne @JoinColumn(name="test_case_id") private TestCase testCase;
}