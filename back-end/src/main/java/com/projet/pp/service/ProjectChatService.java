package com.projet.pp.service;

import com.projet.pp.model.ChatAttachment;
import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.model.User;
import com.projet.pp.repository.ChatAttachmentRepository;
import com.projet.pp.repository.ProjectChatMessageRepository;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class ProjectChatService {

    @Autowired
    private ProjectChatMessageRepository chatRepo;

    @Autowired
    private ProjectRepository projectRepo;

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private ChatAttachmentRepository attachmentRepo;

    /**
     * Répertoire racine pour stocker les pièces jointes
     *  uploads/chats/{messageId}/…
     */
    private final Path chatStorage = Paths.get("uploads/chats")
            .toAbsolutePath()
            .normalize();

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(chatStorage);
    }

    /**
     * Renvoie la liste de tous les messages d’un projet.
     */
    @Transactional(readOnly = true)
    public List<ProjectChatMessage> getAllMessages(Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        // Il faut que le repository expose findByProject(Project)
        return chatRepo.findByProject(project);
    }

    /**
     * Enregistre un nouveau message dans le chat du projet.
     */
    @Transactional
    public ProjectChatMessage sendMessage(Long projectId, Long senderId, String text) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        ProjectChatMessage message = new ProjectChatMessage();
        message.setProject(project);
        message.setSender(sender);
        message.setMessage(text);
        return chatRepo.save(message);
    }

    /**
     * Sauvegarde une pièce jointe liée à un message.
     */
    @Transactional
    public ChatAttachment saveAttachment(Long messageId, MultipartFile file) throws IOException {
        ProjectChatMessage msg = chatRepo.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message introuvable"));

        // Crée le dossier spécifique au message
        Path targetDir = chatStorage.resolve(messageId.toString());
        Files.createDirectories(targetDir);

        // Nettoyage du nom de fichier et sauvegarde
        String filename = StringUtils.cleanPath(file.getOriginalFilename());
        Path dest = targetDir.resolve(filename);
        file.transferTo(dest.toFile());

        ChatAttachment att = new ChatAttachment();
        att.setChatMessage(msg);
        att.setFileName(filename);
        att.setFilePath(dest.toString());
        att.setMimeType(file.getContentType());
        return attachmentRepo.save(att);
    }

    /**
     * Récupère la liste des pièces jointes d’un message.
     */
    @Transactional(readOnly = true)
    public List<ChatAttachment> getAttachments(Long messageId) {
        return attachmentRepo.findByChatMessageId(messageId);
    }
}
