package com.projet.pp.service;

import com.projet.pp.dto.*;
import com.projet.pp.model.*;
import com.projet.pp.repository.*;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.FileSystemUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
public class ProjectService {
@Autowired
private UserService userService;
    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProjectFileRepository projectFileRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectPauseRepository pauseRepo;

    @Autowired
    private ProjectClosureRepository closeRepo;

    @Autowired
    private projectInvitedUserRepository projectInvitedUserRepository;

    @Autowired
    private ProjectTesterAssignmentRepository assignmentRepo;

    @Autowired
    private TacheRepository tacheRepository;

    private final Path baseStorage = Paths.get("uploads/projets").toAbsolutePath().normalize();
    @Autowired
    private ProjectPauseService projectPauseService;

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
        } else{
            for (MultipartFile file : files) {
                String relativePath = file.getOriginalFilename();
                if (relativePath == null) continue;
                String[] parts = relativePath.split("/");
                int startIndex = (parts.length > 1 ? 1 : 0);
                Long currentParentId = null;
                for (int i = startIndex; i < parts.length - 1; i++) {
                    currentParentId = getOrCreateFolder(
                            project,
                            projectStorage,
                            currentParentId,
                            parts[i]
                    );
                }
                saveFileWithParent(file, projectStorage, project, currentParentId);
            }

        }


        return project.getId();
    }
    @Transactional
    public Project updateProjectStatus(Long  ProjectId,int newStatus,Long supervisorId){
        Project projet = projectRepository.findById(ProjectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        projet.setStatus(newStatus);
        User superviser = userService.getUserById(supervisorId);
        if (newStatus == 55) projectPauseService.createPauseByproject(projet,superviser);
        projet =projectRepository.save(projet);
        return projet;

        }


    @Transactional
    protected Long getOrCreateFolder(Project project, Path projectStorage, Long parentFolderId, String folderName) throws IOException {
        ProjectFile parent = null;
        if (parentFolderId != null) {
            parent = projectFileRepository.findById(parentFolderId).orElse(null);
        }
        Optional<ProjectFile> optFolder = projectFileRepository.findByProjectAndNameAndParent(project, folderName, parent);
        if (optFolder.isPresent()) {
            return optFolder.get().getId();
        } else {
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
                    // Lire le contenu
                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                    byte[] buffer = new byte[1024];
                    int len;
                    while ((len = zis.read(buffer)) > 0) {
                        baos.write(buffer, 0, len);
                    }
                    byte[] content = baos.toByteArray();

                    // On décompose le chemin
                    String[] parts = relativePath.split("/");
                    int startIndex = (parts.length > 1 ? 1 : 0);
                    Long currentParentId = null;
                    // Créer ou récupérer les dossiers enfants
                    for (int i = startIndex; i < parts.length - 1; i++) {
                        currentParentId = getOrCreateFolder(
                                project,
                                projectStorage,
                                currentParentId,
                                parts[i]
                        );
                    }
                    // Sauvegarder le fichier décompressé
                    saveFileWithParent(
                            content,
                            parts[parts.length - 1],
                            content.length,
                            projectStorage,
                            project,
                            currentParentId
                    );
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
        String baseName = Paths.get(relativePath).getFileName().toString();
        projectFile.setName(baseName);
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

        syncTaskStatus(project);
    }

    public List<Project> getProjectsByUserId(Long userId) {
        return projectRepository.findByUserId(userId);
    }
    public List<Project> getProjectsByInvitedUserId(Long userId) {
        List<Long> ids = projectInvitedUserRepository.findProjectsIdByUserId(userId);
        return projectRepository.findAllById(ids);

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
        // 1) Charger l’entité existante
        ProjectFile pf = projectFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("Fichier introuvable avec l’ID " + fileId));

        // 2) Écrire le nouveau contenu (en UTF‑8 par défaut) sur le système de fichiers
        Path path = Paths.get(pf.getFilePath());
        // Crée les répertoires parents si nécessaire
        Files.createDirectories(path.getParent());
        // Réécrit entièrement le fichier
        Files.writeString(path, newContent, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

        // 3) Mettre à jour la date de modification
        // Si vous disposez d’un champ `updatedAt`, c’est l’idéal ; ici on réutilise `createdAt` pour la démo
        pf.setCreatedAt(LocalDateTime.now());

        // 4) Sauvegarder en base
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
        // racine disque du projet
        Path projectDir = baseStorage.resolve(projectId.toString());

        // on détermine le dossier parent
        ProjectFile parent = null;
        Path targetDir = projectDir;
        if (parentId != null) {
            parent = projectFileRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Dossier parent introuvable"));
            targetDir = Paths.get(parent.getFilePath());
        }

        // création physique du nouveau dossier
        Path newDir = targetDir.resolve(folderName);
        Files.createDirectories(newDir);

        // enregistrement en base
        ProjectFile pf = new ProjectFile();
        pf.setName(folderName);
        pf.setType(ItemType.FOLDER);
        pf.setProject(project);
        pf.setParent(parent);
        pf.setFilePath(newDir.toString());
        return projectFileRepository.save(pf);
    }

    @Transactional
    public List<ProjectFile> addFiles(Long projectId, Long parentId, MultipartFile[] files) throws IOException {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        Path projectStorage = baseStorage.resolve(projectId.toString());

        ProjectFile parent = null;
        Path targetDir = projectStorage;
        if (parentId != null) {
            parent = projectFileRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Dossier parent introuvable"));
            targetDir = Paths.get(parent.getFilePath());
        }

        List<ProjectFile> saved = new ArrayList<>();
        for (MultipartFile file : files) {
            String filename = StringUtils.cleanPath(file.getOriginalFilename());
            Files.createDirectories(targetDir);
            Path target = targetDir.resolve(filename);

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            }

            ProjectFile pf = new ProjectFile();
            pf.setName(filename);
            pf.setType(ItemType.FILE);
            pf.setProject(project);
            pf.setFilePath(target.toString());
            pf.setFileSize(file.getSize());
            pf.setMimeType(file.getContentType());
            pf.setParent(parent);
            saved.add(projectFileRepository.save(pf));
        }
        return saved;
    }


    public List<ProjectFile> getFilesByProjectIdAndParentId(Long projectId, Long parentId) {
        return projectFileRepository.findByProjectIdAndParentId(projectId, parentId);
    }


    @Transactional
    public ProjectInvitedUser inviteUser(Long projectId, Long userId, String status) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 3. Check for existing invitation
        if (projectInvitedUserRepository.existsByProjectAndUser(project, user)) {
            throw new IllegalStateException(
                    "User " + userId + " is already invited to project " + projectId
            );
        }
        ProjectInvitedUser invitedUser = new ProjectInvitedUser();
        invitedUser.setProject(project);
        invitedUser.setUser(user);
        invitedUser.setStatus(status); // "pending", "accepted", "rejected"
        invitedUser.setInvitedAt(LocalDateTime.now());

        projectInvitedUserRepository.save(invitedUser);
        return invitedUser;
    }


    @Transactional
    public void removeInvitedUser(Long projectId, Long userId) {
        // 1) Vérifier que le projet existe
        projectRepository.findById(projectId)
                .orElseThrow(() ->
                        new EntityNotFoundException("Projet introuvable pour id : " + projectId));

        // 2) Supprimer l’invitation
        int deleted = projectInvitedUserRepository.deleteByProjectIdAndUserId(projectId, userId);
        if (deleted == 0) {
            throw new EntityNotFoundException(
                    "Aucune invitation trouvée pour userId=" + userId +
                            " sur projectId=" + projectId);
        }
    }


    public Project getProjectById(Long projectId) {
        return projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
    }


    @Transactional
    public void updateVisibility(Long projectId, Long userId, String visibilite) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));

        // Vérification si l'utilisateur est celui qui a uploadé le projet
        if (!project.getUser().getId().equals(userId)) {
            throw new RuntimeException("Vous n'avez pas l'autorisation de modifier la visibilité de ce projet.");
        }

        // Vérification du statut (0 ou 1 uniquement)
        if (!(project.getStatus() == 0 || project.getStatus() == 1)) {
            throw new RuntimeException("Le projet doit être en statut 0 ou 1 pour pouvoir modifier sa visibilité.");
        }

        // Mise à jour de la visibilité
        if ("public".equals(visibilite)) {
            project.setVisibilite("public");
            project.setStatus(1);  // Change le statut en "1" pour "public"
        } else if ("privée".equals(visibilite)) {
            project.setVisibilite("privée");
            project.setStatus(0);  // Change le statut en "0" pour "privée"
        }

        project.setUpdatedAt(LocalDateTime.now());

        projectRepository.save(project);

        syncTaskStatus(project);
    }



    public ProjectStatsDTO getProjectStats(Long projectId) {
        List<ProjectFile> files = projectFileRepository.findByProjectIdAndType(projectId, ItemType.FILE);
        Map<String, Long> counts = files.stream()
                .map(f -> {
                    String name = f.getName();
                    int i = name.lastIndexOf('.');
                    return (i >= 0) ? name.substring(i + 1).toLowerCase() : "other";
                })
                .collect(Collectors.groupingBy(ext -> ext, Collectors.counting()));
        long total = files.size();
        return new ProjectStatsDTO(total, counts);
    }

    public List<InvitedUserDTO> getInvitedUsers(Long projectId) {
        return projectInvitedUserRepository.findByProjectId(projectId)
                .stream()
                .map(inv -> InvitedUserDTO.builder()
                        .id(inv.getId())
                        .userId(inv.getUser().getId())
                        .prenom(inv.getUser().getPrenom())
                        .nom(inv.getUser().getNom())
                        .status(inv.getStatus())
                        .invitedAt(inv.getInvitedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteProject(Long projectId) {
        try {
            // Suppression du projet et de ses fichiers
            Project project = projectRepository.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Le projet avec l'ID " + projectId + " n'a pas été trouvé"));

            // Supprimer les fichiers associés au projet
            Path projectDir = baseStorage.resolve(projectId.toString());
            if (Files.exists(projectDir)) {
                try {
                    FileSystemUtils.deleteRecursively(projectDir); // Supprimer les fichiers du projet
                } catch (IOException e) {
                    throw new RuntimeException("Erreur lors de la suppression des fichiers du projet " + projectId, e);
                }
            }

            // Supprimer les invitations associées au projet
            projectInvitedUserRepository.deleteByProjectId(projectId);  // Suppression des invitations

            // Supprimer le projet
            projectRepository.deleteById(projectId);
        } catch (OptimisticLockException ex) {
            throw new RuntimeException("Le projet a été modifié entre-temps par une autre transaction", ex);
        }
    }

    @Transactional
    public void archiveProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        project.setStatus(-1);
        projectRepository.save(project);
        syncTaskStatus(project);
    }

    public List<FinishedProjectDTO> getFinishedDetails() {
        // Recherche des projets mis en pause et clôturés
        List<Project> list55 = projectRepository.findByStatus(55);  // projets en pause
        List<Project> list99 = projectRepository.findByStatus(99);  // projets clôturés
        List<Project> all = Stream.concat(list55.stream(), list99.stream()).collect(Collectors.toList());

        List<FinishedProjectDTO> result = new ArrayList<>();
        for (Project p : all) {
            FinishedProjectDTO dto = new FinishedProjectDTO();
            dto.setProjectId(p.getId());
            dto.setName(p.getName());
            dto.setStatus(p.getStatus());

            // Récupérer les informations selon le statut (pauses ou clôtures)
            if (p.getStatus() == 55) {  // Si le projet est en pause
                ProjectPause pause = pauseRepo.findFirstByProjectIdOrderByPausedAtDesc(p.getId()).orElse(null);
                if (pause != null) {
                    dto.setPausedAt(pause.getPausedAt());  // Utilisation de pausedAt
                    dto.setSupervisorName(pause.getSupervisor().getPrenom() + " " + pause.getSupervisor().getNom());
                }
            } else {  // Si le projet est clôturé
                ProjectClosure closure = closeRepo.findFirstByProjectIdOrderByClosureAtDesc(p.getId()).orElse(null);
                if (closure != null) {
                    dto.setClosureAt(closure.getClosureAt());  // Utilisation de closureAt
                    dto.setSupervisorName(closure.getSupervisor().getPrenom() + " " + closure.getSupervisor().getNom());
                }
            }

            // Liste des testeurs associés au projet
            List<String> testers = assignmentRepo.findByProjectId(p.getId())
                    .stream()
                    .map(a -> a.getTesteur().getPrenom() + " " + a.getTesteur().getNom())
                    .collect(Collectors.toList());
            dto.setTesterNames(testers);

            result.add(dto);
        }
        return result;
    }


    // Relancer un projet en phase de test (remettre le statut à 2)
    @Transactional
    public void restartTestPhase(Long projectId) {
        Project projet = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));

        // Vérifier que le projet est en pause ou clôturé avant de le relancer
        if (projet.getStatus() != 55 && projet.getStatus() != 99) {
            throw new RuntimeException("Le projet n'est pas en statut 'en pause' ou 'clôturé'");
        }
        // Réinitialiser le statut à 2 (en test)
        projet.setStatus(2);
        projectRepository.save(projet);

        syncTaskStatus(projet);
    }


    private Tache.Status mapProjectStatusToTaskStatus(Integer projectStatus) {
        if (projectStatus == null) {
            return Tache.Status.a_developper;
        }
        return switch (projectStatus) {
            case 2, 3  -> Tache.Status.en_cours;
            case 4     -> Tache.Status.terminé;
            case 55    -> Tache.Status.suspendu;
            case 99    -> Tache.Status.cloturé;
            default    -> Tache.Status.a_developper;
        };
    }


    @Transactional
    protected void syncTaskStatus(Project project) {
        // Récupère la tâche (OneToOne) liée au projet
        Optional<Tache> opt = tacheRepository.findByProject_Id(project.getId());
        if (opt.isPresent()) {
            Tache t = opt.get();
            Tache.Status newStatus = mapProjectStatusToTaskStatus(project.getStatus());
            if (t.getStatus() != newStatus) {
                t.setStatus(newStatus);
                tacheRepository.save(t);
            }
        }
    }


    @Transactional(readOnly = true)
    public Optional<ProjectPause> findLastPause(Long projectId) {
        return pauseRepo.findFirstByProjectIdOrderByPausedAtDesc(projectId);
    }

    @Transactional(readOnly = true)
    public Optional<ProjectClosure> findLastClosure(Long projectId) {
        return closeRepo.findFirstByProjectIdOrderByClosureAtDesc(projectId);
    }

    @Transactional(readOnly = true)
    public Resource downloadProjectContent(Long projectId) throws IOException {
        // 1) Récupère tous les ProjectFile du projet (fichiers et dossiers)
        List<ProjectFile> allEntries = projectFileRepository.findByProjectId(projectId);

        // 2) Prépare le ZIP en mémoire
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            Path projectRoot = baseStorage.resolve(projectId.toString());

            for (ProjectFile pf : allEntries) {
                // On ne considère que les fichiers
                if (pf.getType() != ItemType.FILE) {
                    continue;
                }

                Path filePath = Paths.get(pf.getFilePath());
                if (!Files.isRegularFile(filePath)) {
                    // en bonus on vérifie que c'est bien un fichier
                    continue;
                }

                // Calcul du chemin relatif pour l'entrée ZIP
                Path relative = projectRoot.relativize(filePath);
                String zipEntryName = relative.toString().replace("\\", "/");

                zos.putNextEntry(new ZipEntry(zipEntryName));
                Files.copy(filePath, zos);
                zos.closeEntry();
            }
        }

        // 3) On renvoie le ZIP sous forme de Resource
        return new ByteArrayResource(baos.toByteArray());
    }
    public long getWeek() {
        return countByStatusInLastDays(5, 7);
    }

    /** Completed projects in the last 30 days */
    public long getMonth() {
        return countByStatusInLastDays(5, 30);
    }

    /** Completed projects in the last 365 days */
    public long getYear() {
        return countByStatusInLastDays(5, 365);
    }

    /** Projects that entered “Testing” (status = 4) in the last 7 days */
    public long getToTestingWeek() {
        return countByStatusInLastDays(2, 7);
    }

    /** Projects that entered “Testing” in the last 30 days */
    public long getToTestingMonth() {
        return countByStatusInLastDays(2, 30);
    }

    /** Projects that entered “Testing” in the last 365 days */
    public long getToTestingYear() {
        return countByStatusInLastDays(2, 365);
    }

    /** Total number of projects in the database */
    public long getTotalProjects() {
        return projectRepository.count();
    }



    public long getWeekAndUserId(long id) {
        return countByStatusInLastDaysAndUserId(5, 7 ,id);
    }

    /** Completed projects in the last 30 days */
    public long getMonthAndUserId(long id) {
        return countByStatusInLastDaysAndUserId(5, 30,id);
    }

    /** Completed projects in the last 365 days */
    public long getYearAndUserId(long id) {
        return countByStatusInLastDaysAndUserId(5, 365,id);
    }

    /** Projects that entered “Testing” (status = 4) in the last 7 days */
    public long getToTestingWeekAndUserId(long id) {
        return countByStatusInLastDaysAndUserId(2, 7,id);
    }

    /** Projects that entered “Testing” in the last 30 days */
    public long getToTestingMonthAndUserId(long id) {
        return countByStatusInLastDaysAndUserId(2, 30,id);
    }

    /** Projects that entered “Testing” in the last 365 days */
    public long getToTestingYearAndUserId(long id) {
        return countByStatusInLastDaysAndUserId(2, 365,id);
    }

    /** Total number of projects in the database */
    public long getTotalProjectsAndUserId() {
        return projectRepository.count();
    }

    // ——— Private Helper ———

    /**
     * DRY helper: count projects by `status` whose updatedAt timestamp
     * falls within [now − days, now].
     */




    public long getWeekAndTesteurId(long id) {
        return countByStatusInLastDaysAndTesteurId(5, 7 ,id);
    }

    /** Completed projects in the last 30 days */
    public long getMonthAndTesteurId(long id) {
        return countByStatusInLastDaysAndTesteurId(5, 30,id);
    }

    /** Completed projects in the last 365 days */
    public long getYearAndTesteurId(long id) {
        return countByStatusInLastDaysAndTesteurId(5, 365,id);
    }

    /** Projects that entered “Testing” (status = 4) in the last 7 days */
    public long getToTestingWeekAndTesteurId(long id) {
        return countByStatusInLastDaysAndTesteurId(2, 7,id);
    }

    /** Projects that entered “Testing” in the last 30 days */
    public long getToTestingMonthAndTesteurId(long id) {
        return countByStatusInLastDaysAndTesteurId(2, 30,id);
    }

    /** Projects that entered “Testing” in the last 365 days */
    public long getToTestingYearAndTesteurId(long id) {
        return countByStatusInLastDaysAndTesteurId(2, 365,id);
    }

    /** Total number of projects in the database */
    public long getTotalProjectsAndTesteurId() {
        return projectRepository.count();
    }




    private long countByStatusInLastDays(int status, int days) {
        LocalDateTime now  = LocalDateTime.now();
        LocalDateTime from = now.minusDays(days);
        return projectRepository.countByStatusAndUpdatedAtBetween(status, from, now);
    }
    private long countByStatusInLastDaysAndUserId(int status, int days ,long id) {
        LocalDateTime now  = LocalDateTime.now();
        LocalDateTime from = now.minusDays(days);
        return projectRepository.countByUser_IdAndStatusAndUpdatedAtBetween(id ,status, from, now);
    }

    private long countByStatusInLastDaysAndTesteurId(int projectStatus, int days ,long id) {
        LocalDateTime now  = LocalDateTime.now();
        LocalDateTime from = now.minusDays(days);
        return assignmentRepo.countProjectsByTesteur_IdAndProject_StatusAndProject_UpdatedAtBetween(id ,projectStatus, from, now);
    }

        @Transactional
        public ProjectInvitedUser decideInvitation(
                Long projectId,
                Long userId,
                String newStatus
        ) {
            // 1️⃣ load the invite row (or 404)
            ProjectInvitedUser iu = projectInvitedUserRepository
                    .findByProjectIdAndUserId(projectId, userId)
                    .orElseThrow(() ->
                            new EntityNotFoundException(
                                    "Invitation not found for project " + projectId + " & user " + userId
                            )
                    );

            // 2️⃣ update
            iu.setStatus(newStatus);
            iu.setInvitedAt(LocalDateTime.now());  // optional: stamp the change time

            // 3️⃣ persist
            ProjectInvitedUser saved = projectInvitedUserRepository.save(iu);


            return saved;
        }
    public List<Project> findInvitedProjects(Long userId) {
        // 1. find all projectIds for that user
        List<Long> projIds = projectInvitedUserRepository.findProjectsIdByUserId(userId);
        if (projIds.isEmpty()) {
            return Collections.emptyList();
        }
        // 2. load all matching Project entities in one go
        return projectRepository.findAllById(projIds);
    }
    public List<Project> findAcceptedInvitedProjects(Long userId) {
        // 1) only get IDs for invites with status='accepted'
        List<Long> acceptedIds = projectInvitedUserRepository.findAcceptedProjectIdsByUserId(userId);
        if (acceptedIds.isEmpty()) {
            return Collections.emptyList();
        }
        // 2) fetch all matching Projects
        return projectRepository.findAllById(acceptedIds);
    }



    @Transactional(readOnly = true)
    public List<UserDto> getInviteableUsers(Long projectId) {
        Project p = projectRepository.findById(projectId)
                .orElseThrow(() -> new EntityNotFoundException("Projet introuvable : " + projectId));

        Long ownerId = p.getUser().getId();
        List<User> candidates = userRepository.findInviteableUsers(projectId, ownerId);
        return candidates.stream()
                .map(UserDto::fromEntity)
                .toList();
    }
}



