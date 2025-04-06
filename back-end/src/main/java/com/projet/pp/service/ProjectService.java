package com.projet.pp.service;

import com.projet.pp.dto.ProjectFileNode;
import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectFile;
import com.projet.pp.model.User;
import com.projet.pp.model.ItemType;
import com.projet.pp.repository.ProjectFileRepository;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
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

    public List<Project> getAllProjects() {
        return projectRepository.findAll();
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
    public void commitProject(Long projectId, String name, String type, String description, String visibilite, String status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        project.setName(name);
        project.setType(type);
        project.setDescription(description);
        project.setVisibilite(visibilite);
        project.setCommitted(true); // Finalisé
        project.setUpdatedAt(LocalDateTime.now());
        project.setStatus(Integer.valueOf(status));
        projectRepository.save(project);
    }

    public List<Project> getProjectsByUserId(Long userId) {
        return projectRepository.findByUserId(userId);
    }

    public List<ProjectFile> getFilesByProjectId(Long projectId) {
        // Vous pouvez ajouter une méthode dans ProjectFileRepository pour récupérer par projectId
        return projectFileRepository.findByProjectId(projectId);
    }

    public List<ProjectFileNode> buildProjectFileTree(Long projectId) {
        List<ProjectFile> files = projectFileRepository.findByProjectId(projectId);
        // Map pour associer chaque fichier à son DTO
        Map<Long, ProjectFileNode> nodeMap = new HashMap<>();
        List<ProjectFileNode> roots = new ArrayList<>();

        // Créer les nœuds de base
        for (ProjectFile file : files) {
            ProjectFileNode node = new ProjectFileNode();
            node.setId(file.getId());
            node.setName(file.getName());
            node.setType(file.getType());
            node.setFilePath(file.getFilePath());
            nodeMap.put(file.getId(), node);
        }

        // Construire l'arbre
        for (ProjectFile file : files) {
            ProjectFileNode node = nodeMap.get(file.getId());
            if (file.getParent() != null && file.getParent().getId() != null) {
                ProjectFileNode parentNode = nodeMap.get(file.getParent().getId());
                if (parentNode != null) {
                    parentNode.getChildren().add(node);
                }
            } else {
                // Pas de parent : c'est un nœud racine
                roots.add(node);
            }
        }
        return roots;
    }

    public String getFileContent(Long fileId) throws IOException {
        ProjectFile pf = projectFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Fichier introuvable"));
        return Files.readString(Paths.get(pf.getFilePath()));
    }


    @Transactional
    public void updateFileContent(Long fileId, String newContent) throws IOException {
        ProjectFile pf = projectFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Fichier introuvable"));

        Path path = Paths.get(pf.getFilePath());
        // Remplacer le contenu
        Files.writeString(path, newContent, StandardOpenOption.TRUNCATE_EXISTING);

        // Si vous souhaitez mettre à jour la date de modification en base :
        pf.setCreatedAt(LocalDateTime.now()); // ou un champ updatedAt si vous en avez un
        projectFileRepository.save(pf);
    }


    @Transactional
    public void deleteFile(Long fileId) throws IOException {
        ProjectFile pf = projectFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Fichier introuvable"));

        // Supprimer du disque
        Path path = Paths.get(pf.getFilePath());
        Files.deleteIfExists(path);

        // Supprimer l'entité
        projectFileRepository.delete(pf);
    }


    /**
     * Crée un dossier vide dans le projet.
     */
    @Transactional
    public ProjectFile createFolder(Long projectId, Long parentId, String folderName) throws IOException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        Path projectStorage = baseStorage.resolve(projectId.toString());

        // Calcule le chemin relatif du parent
        String relativeFolder = "";
        if (parentId != null) {
            ProjectFile parent = projectFileRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Dossier parent introuvable"));
            Path parentPath = Paths.get(parent.getFilePath()).getParent();
            relativeFolder = baseStorage.resolve(projectId.toString())
                    .relativize(parentPath).toString();
        }

        // Crée physiquement le dossier
        Path dir = projectStorage.resolve(relativeFolder).resolve(folderName);
        Files.createDirectories(dir);

        // Enregistre en base
        ProjectFile pf = new ProjectFile();
        pf.setName(folderName);
        pf.setType(ItemType.FOLDER);
        pf.setProject(project);
        pf.setFilePath(dir.toString());
        return projectFileRepository.save(pf);
    }

    /**
     * Ajoute des fichiers (upload) dans le dossier parent donné.
     */
    @Transactional
    public List<ProjectFile> addFiles(Long projectId, Long parentId, MultipartFile[] files) throws IOException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        Path projectStorage = baseStorage.resolve(projectId.toString());

        // Calcule le chemin relatif du parent
        String relativeFolder = "";
        if (parentId != null) {
            ProjectFile parent = projectFileRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Dossier parent introuvable"));
            Path parentPath = Paths.get(parent.getFilePath()).getParent();
            relativeFolder = baseStorage.resolve(projectId.toString())
                    .relativize(parentPath).toString();
        }

        List<ProjectFile> saved = new ArrayList<>();
        for (MultipartFile file : files) {
            String filename = StringUtils.cleanPath(file.getOriginalFilename());
            Path target = projectStorage.resolve(relativeFolder).resolve(filename);
            Files.createDirectories(target.getParent());
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            ProjectFile pf = new ProjectFile();
            pf.setName(filename);
            pf.setType(ItemType.FILE);
            pf.setProject(project);
            pf.setFilePath(target.toString());
            pf.setFileSize(file.getSize());
            pf.setMimeType(file.getContentType());
            saved.add(projectFileRepository.save(pf));
        }
        return saved;
    }

    public List<ProjectFile> getFilesByProjectIdAndParentId(Long projectId, Long parentId) {
        return projectFileRepository.findByProjectIdAndParentId(projectId, parentId);
    }

}
