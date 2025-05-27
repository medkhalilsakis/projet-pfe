package com.projet.pp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
@Table(name = "test_case")
public class TestCase {

    @Id @GeneratedValue private Long id;

    private String caseNumber, title, subsystem;

    @Column(columnDefinition="TEXT") private String description;

    private LocalDate executionDate;

    @Column(columnDefinition="TEXT") private String preconditions, postconditions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
    private Project project;


    @OneToMany(mappedBy = "testCase",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<TestCaseStep> steps = new ArrayList<>();

}
