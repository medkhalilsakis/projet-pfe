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

    @Autowired
    private ProjectClosureRepository closureRepo;


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
        project.setName("Projet_" + System.currentTimeMillis());
        project.setVisibilite("privée");
        project.setDescription("");
        project.setCommitted(false);
        project.setUser(user);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());

        project = projectRepository.save(project);
        Path projectStorage = baseStorage.resolve(project.getId().toString());
        Files.createDirectories(projectStorage);

        if (decompress && files.length > 0 && isArchive(files[0])) {
            for (MultipartFile file : files) {
                decompressArchive(file, projectStorage, project);
            }
        } else {
            for (MultipartFile file : files) {
                // Supposons que file.getOriginalFilename() contient le chemin relatif (ex: "test/A/C/test.txt")
                String relativePath = file.getOriginalFilename();
                if (relativePath == null) continue;
                String[] parts = relativePath.split("/");
                // Le dernier élément est le nom du fichier
                String fileName = parts[parts.length - 1];
                Long currentParentId = null;
                // Pour chaque dossier du chemin, on crée ou récupère le dossier
                for (int i = 0; i < parts.length - 1; i++) {
                    String folderName = parts[i];
                    currentParentId = getOrCreateFolder(project, projectStorage, currentParentId, folderName);
                }
                // Enregistrer le fichier avec le parent déterminé
                saveFileWithParent(file, projectStorage, project, currentParentId);
            }
        }

        return project.getId();
    }

    @Transactional
    protected Long getOrCreateFolder(Project project, Path projectStorage, Long parentFolderId, String folderName) throws IOException {
        ProjectFile parent = null;
        if (parentFolderId != null) {
            parent = projectFileRepository.findById(parentFolderId).orElse(null);
        }
        // On cherche un dossier dans le projet qui porte ce nom et qui a le même parent
        Optional<ProjectFile> optFolder = projectFileRepository.findByProjectAndNameAndParent(project, folderName, parent);
        if (optFolder.isPresent()) {
            return optFolder.get().getId();
        } else {
            // Déterminer le chemin du nouveau dossier
            Path dir;
            if (parent != null) {
                dir = Paths.get(parent.getFilePath()).resolve(folderName);
            } else {
                dir = projectStorage.resolve(folderName);
            }
            Files.createDirectories(dir);

            ProjectFile folder = new ProjectFile();
            folder.setName(folderName);
            folder.setType(ItemType.FOLDER);
            folder.setProject(project);
            folder.setFilePath(dir.toString());
            folder.setParent(parent);
            ProjectFile savedFolder = projectFileRepository.save(folder);
            return savedFolder.getId();
        }
    }

    // Méthode pour déterminer si le fichier est une archive
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
                    // Pour le décompressé, on suppose que la structure du zip correspond à l'arborescence
                    // Ici, on peut appeler saveFileWithParent en découpant relativePath comme dans uploadProject
                    String[] parts = relativePath.split("/");
                    Long currentParentId = null;
                    for (int i = 0; i < parts.length - 1; i++) {
                        String folderName = parts[i];
                        currentParentId = getOrCreateFolder(project, projectStorage, currentParentId, folderName);
                    }
                    saveFileWithParent(fileContent, zipEntry.getName(), zipEntry.getSize(), projectStorage, project, currentParentId);
                }
                zis.closeEntry();
            }
        }
    }

    private void saveFileWithParent(MultipartFile file, Path projectStorage, Project project, Long parentId) throws IOException {
        ProjectFile parent = null;
        if (parentId != null) {
            parent = projectFileRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Dossier parent non trouvé"));
        }
        Path targetLocation;
        if (parent != null) {
            targetLocation = Paths.get(parent.getFilePath()).resolve(file.getOriginalFilename());
        } else {
            targetLocation = projectStorage.resolve(file.getOriginalFilename());
        }
        Files.createDirectories(targetLocation.getParent());
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        ProjectFile projectFile = new ProjectFile();
        projectFile.setName(file.getOriginalFilename());
        projectFile.setFilePath(targetLocation.toString());
        projectFile.setFileSize(file.getSize());
        projectFile.setMimeType(file.getContentType());
        projectFile.setType(ItemType.FILE);
        projectFile.setProject(project);
        projectFile.setParent(parent);
        projectFileRepository.save(projectFile);
    }

    // Méthode pour sauvegarder un fichier décompressé (à partir d'un tableau de bytes) avec son parent
    private void saveFileWithParent(byte[] content, String relativePath, long size, Path projectStorage, Project project, Long parentId) throws IOException {
        ProjectFile parent = null;
        if (parentId != null) {
            parent = projectFileRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Dossier parent non trouvé"));
        }
        Path targetLocation;
        if (parent != null) {
            targetLocation = Paths.get(parent.getFilePath()).resolve(relativePath);
        } else {
            targetLocation = projectStorage.resolve(relativePath);
        }
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
        projectFile.setParent(parent);
        projectFileRepository.save(projectFile);
    }

    // Pour finaliser le projet : mise à jour des métadonnées
    public void commitProject(Long projectId, String name, String type, String description, String visibilite, String status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        project.setName(name);
        project.setType(type);
        project.setDescription(description);
        project.setVisibilite(visibilite);
        project.setCommitted(true);
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
        Map<Long, ProjectFileNode> nodeMap = new HashMap<>();
        List<ProjectFileNode> roots = new ArrayList<>();

        for (ProjectFile file : files) {
            ProjectFileNode node = new ProjectFileNode();
            node.setId(file.getId());
            node.setName(file.getName());
            node.setType(file.getType());
            node.setFilePath(file.getFilePath());
            nodeMap.put(file.getId(), node);
        }

        for (ProjectFile file : files) {
            ProjectFileNode node = nodeMap.get(file.getId());
            if (file.getParent() != null && file.getParent().getId() != null) {
                ProjectFileNode parentNode = nodeMap.get(file.getParent().getId());
                if (parentNode != null) {
                    parentNode.getChildren().add(node);
                }
            } else {
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

    @Transactional
    public void closeProject(Long projectId, Long supervisorId, String reason) {
        Project proj = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        User sup = userRepository.findById(supervisorId)
                .orElseThrow(() -> new RuntimeException("Superviseur non trouvé"));

        // 1) Enregistrer la raison
        ProjectClosure closure = new ProjectClosure();
        closure.setProject(proj);
        closure.setSupervisor(sup);
        closure.setReason(reason);
        closureRepo.save(closure);

        // 2) Mettre à jour le statut du projet
        proj.setStatus(3);
        projectRepository.save(proj);
    }


}
