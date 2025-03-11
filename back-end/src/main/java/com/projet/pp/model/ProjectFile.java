package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "project_files")
@Getter
@Setter
public class ProjectFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String filePath; // Chemin de stockage sur le serveur
    private Long size;
    private String contentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    // Constructeurs, getters et setters

    public ProjectFile() {}

    public ProjectFile(String fileName, String filePath, Long size, String contentType, Project project) {
        this.fileName = fileName;
        this.filePath = filePath;
        this.size = size;
        this.contentType = contentType;
        this.project = project;
    }

    // Ajoutez ici les getters et setters
    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
}
