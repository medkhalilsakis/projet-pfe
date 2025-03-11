package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "projects")
@Getter
@Setter
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ProjectFile> files = new ArrayList<>();

    // Constructeurs, getters et setters

    public Project() {}

    public Project(String name) {
        this.name = name;
    }

    // Ajoutez ici les getters et setters
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public List<ProjectFile> getFiles() { return files; }
    public void setFiles(List<ProjectFile> files) { this.files = files; }
}
