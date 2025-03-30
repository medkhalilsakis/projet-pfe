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
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
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
        // Nom auto-généré initialement
        project.setName("Projet_" + System.currentTimeMillis());
        project.setVisibilite("privée");
        project.setDescription("");
        project.setCommitted(false);
        project.setUser(user);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());

        project = projectRepository.save(project); // Enregistrement pour obtenir l'ID

        // Créer le répertoire de stockage pour ce projet
        Path projectStorage = baseStorage.resolve(project.getId().toString());
        Files.createDirectories(projectStorage);

        // Pour chaque fichier, si on doit décompresser et que le fichier est une archive, décompresse sinon sauvegarde tel quel
        for (MultipartFile file : files) {
            if (decompress && isArchive(file)) {
                decompressArchive(file, projectStorage, project);
            } else {
                saveFile(file, projectStorage, project, "");
            }
        }

        return project.getId();
    }

    // Modification : vérifier par extension (non par type MIME)
    private boolean isArchive(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        return originalFilename != null && originalFilename.toLowerCase().endsWith(".zip");
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

    // Pour finaliser le projet : on met à jour le nom, type, description et visibilité.
    // Ici, on considère que finaliser le projet signifie passer committed à true.
    public void commitProject(Long projectId, String name, String type, String description, String visibilite) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        project.setName(name);
        project.setType(type);
        project.setDescription(description);
        project.setVisibilite(visibilite);
        project.setCommitted(true); // Finalisé
        project.setUpdatedAt(LocalDateTime.now());

        projectRepository.save(project);
    }

    public List<Project> getProjectsByUserId(Long userId) {
        return projectRepository.findByUserId(userId);
    }

    public List<ProjectFile> getFilesByProjectId(Long projectId) {
        // Vous pouvez ajouter une méthode dans ProjectFileRepository pour récupérer par projectId
        return projectFileRepository.findByProjectId(projectId);
    }

}
