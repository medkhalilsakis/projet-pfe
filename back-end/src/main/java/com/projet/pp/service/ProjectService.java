package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectFile;
import com.projet.pp.repository.ProjectFileRepository;
import com.projet.pp.repository.ProjectRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectFileRepository projectFileRepository;

    // Répertoire de stockage des fichiers uploadés
    private final Path storageLocation = Paths.get("uploads").toAbsolutePath().normalize();

    // Pour cet exemple, on utilise un projet temporaire en session
    private Project currentProject;

    public ProjectService() {
        try {
            Files.createDirectories(storageLocation);
        } catch (Exception e) {
            throw new RuntimeException("Impossible de créer le dossier de stockage.", e);
        }
    }

    public void uploadProject(MultipartFile[] files, boolean decompress) throws IOException {
        // Création d'un nouveau projet
        currentProject = new Project("Projet_" + System.currentTimeMillis());
        projectRepository.save(currentProject);

        for (MultipartFile file : files) {
            if (decompress && isArchive(file)) {
                decompressArchive(file);
            } else {
                // Sauvegarde du fichier directement
                saveFile(file, "");
            }
        }
    }

    // Vérifie si le fichier est une archive ZIP (peut être étendu à d'autres types)
    private boolean isArchive(MultipartFile file) {
        String contentType = file.getContentType();
        return "application/zip".equals(contentType) || "application/x-zip-compressed".equals(contentType);
    }

    // Décompresse une archive ZIP et sauvegarde les fichiers extraits
    private void decompressArchive(MultipartFile file) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry zipEntry;
            while ((zipEntry = zis.getNextEntry()) != null) {
                if (!zipEntry.isDirectory()) {
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        baos.write(buffer, 0, len);
                    }
                    byte[] fileContent = baos.toByteArray();
                    // Enregistre le fichier avec le chemin relatif contenu dans zipEntry
                    saveFile(zipEntry.getName(), fileContent, zipEntry.getSize());
                }
                zis.closeEntry();
            }
        }
    }

    // Sauvegarde d'un fichier provenant d'une archive
    private void saveFile(String relativePath, byte[] content, long size) throws IOException {
        Path targetLocation = this.storageLocation.resolve(relativePath);
        Files.createDirectories(targetLocation.getParent());
        Files.write(targetLocation, content, StandardOpenOption.CREATE);

        // Enregistrement des métadonnées dans la base de données
        ProjectFile projectFile = new ProjectFile();
        projectFile.setFileName(relativePath);
        projectFile.setFilePath(targetLocation.toString());
        projectFile.setSize(size);
        projectFile.setContentType("application/octet-stream"); // Vous pouvez déterminer le type réel si nécessaire
        projectFile.setProject(currentProject);
        projectFileRepository.save(projectFile);
    }

    // Sauvegarde d'un fichier MultipartFile normal
    private void saveFile(MultipartFile file, String relativeFolder) throws IOException {
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        Path targetLocation = this.storageLocation.resolve(relativeFolder).resolve(fileName);
        Files.createDirectories(targetLocation.getParent());
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        ProjectFile projectFile = new ProjectFile();
        projectFile.setFileName(fileName);
        projectFile.setFilePath(targetLocation.toString());
        projectFile.setSize(file.getSize());
        projectFile.setContentType(file.getContentType());
        projectFile.setProject(currentProject);
        projectFileRepository.save(projectFile);
    }

    // Méthode de "commit" pour finaliser le projet
    public void commitProject() {
        // Ici vous pouvez réaliser des opérations complémentaires (par ex. indexation, génération d’un rapport, etc.)
        // Pour cet exemple, nous nous contentons de finaliser le projet déjà enregistré.
    }
}
