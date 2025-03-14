package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectFile;
import com.projet.pp.model.User;
import com.projet.pp.model.ItemType;
import com.projet.pp.repository.ProjectFileRepository;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ProjectService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectFileRepository projectFileRepository;

    @Autowired
    private UserRepository userRepository;


    private final Path baseStorage = Paths.get("uploads/projets").toAbsolutePath().normalize();

    public ProjectService() {
        try {
            Files.createDirectories(baseStorage);
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire de stockage.", e);
        }
    }


    public Long uploadProject(MultipartFile[] files, boolean decompress, Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Project project = new Project();
        project.setName("Projet_" + System.currentTimeMillis());
        project.setVisibilite("privée");
        project.setDescription("");
        project.setCommitted(false);
        project.setUser(user);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());

        project = projectRepository.save(project); // Sauvegarde et récupération de l'ID généré

        // Répertoire de stockage pour ce projet
        Path projectStorage = baseStorage.resolve(project.getId().toString());
        Files.createDirectories(projectStorage);

        // Traitement des fichiers uploadés
        for (MultipartFile file : files) {
            if (decompress && isArchive(file)) {
                decompressArchive(file, projectStorage, project);
            } else {
                saveFile(file, projectStorage, project, "");
            }
        }

        return project.getId(); // Retourne l'ID du projet
    }

    // Vérifie si le fichier est une archive ZIP
    private boolean isArchive(MultipartFile file) {
        String contentType = file.getContentType();
        return "application/zip".equals(contentType) || "application/x-zip-compressed".equals(contentType);
    }


    private void decompressArchive(MultipartFile file, Path projectStorage, Project project) throws IOException {
        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry zipEntry;
            while ((zipEntry = zis.getNextEntry()) != null) {
                String relativePath = zipEntry.getName();
                if (!zipEntry.isDirectory()) {
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        baos.write(buffer, 0, len);
                    }
                    byte[] fileContent = baos.toByteArray();
                    saveFile(relativePath, fileContent, zipEntry.getSize(), projectStorage, project);
                }
                zis.closeEntry();
            }
        }
    }


    private void saveFile(MultipartFile file, Path projectStorage, Project project, String relativeFolder) throws IOException {
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        Path targetLocation = projectStorage.resolve(relativeFolder).resolve(fileName);
        Files.createDirectories(targetLocation.getParent());
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);


        ProjectFile projectFile = new ProjectFile();
        projectFile.setName(fileName);
        projectFile.setFilePath(targetLocation.toString());
        projectFile.setFileSize(file.getSize());
        projectFile.setMimeType(file.getContentType());
        projectFile.setType(ItemType.FILE);
        projectFile.setProject(project);
        projectFileRepository.save(projectFile);
    }


    private void saveFile(String relativePath, byte[] content, long size, Path projectStorage, Project project) throws IOException {
        Path targetLocation = projectStorage.resolve(relativePath);
        Files.createDirectories(targetLocation.getParent());
        try (FileOutputStream fos = new FileOutputStream(targetLocation.toFile())) {
            fos.write(content);
        }

        ProjectFile projectFile = new ProjectFile();
        projectFile.setName(relativePath);
        projectFile.setFilePath(targetLocation.toString());
        projectFile.setFileSize(size);
        projectFile.setMimeType("application/octet-stream");
        projectFile.setType(ItemType.FILE);
        projectFile.setProject(project);
        projectFileRepository.save(projectFile);
    }


    public void commitProject(Long projectId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        project.setCommitted(true);
        project.setUpdatedAt(LocalDateTime.now());
        projectRepository.save(project);
    }
}
