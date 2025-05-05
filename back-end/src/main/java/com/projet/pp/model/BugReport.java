package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class BugReport {
    @Id @GeneratedValue private Long id;
    private String level;  // critial, major, minor
    @Column(columnDefinition="TEXT") private String description, suggestions;
    @ElementCollection private List<String> attachments;
    @ManyToOne @JoinColumn(name="project_id") private Project project;
}
