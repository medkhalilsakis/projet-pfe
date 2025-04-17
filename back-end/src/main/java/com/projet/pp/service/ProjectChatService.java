package com.projet.pp.service;

import com.projet.pp.model.MessageType;
import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.model.User;
import com.projet.pp.repository.ProjectChatMessageRepository;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ProjectChatService {

    @Autowired
    private ProjectChatMessageRepository chatRepo;

    @Autowired
    private ProjectRepository projectRepo;

    @Autowired
    private UserRepository userRepo;

    public List<ProjectChatMessage> getPublicMessages(Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        return chatRepo.findByProjectAndMessageType(project, MessageType.PUBLIC);
    }

    public List<ProjectChatMessage> getPrivateMessages(Long projectId, Long requesterId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        // Seul l'uploader (développeur) peut consulter
        if (!project.getUser().getId().equals(requesterId)) {
            throw new RuntimeException("Accès refusé aux commentaires privés");
        }
        return chatRepo.findByProjectAndMessageType(project, MessageType.PRIVATE);
    }

    @Transactional
    public ProjectChatMessage sendPublicMessage(Long projectId, Long senderId, String message) {
        return sendMessage(projectId, senderId, message, MessageType.PUBLIC);
    }

    @Transactional
    public ProjectChatMessage sendPrivateMessage(Long projectId, Long senderId, String message) {
        return sendMessage(projectId, senderId, message, MessageType.PRIVATE);
    }

    @Transactional
    protected ProjectChatMessage sendMessage(Long projectId, Long senderId, String message, MessageType type) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        ProjectChatMessage chatMessage = new ProjectChatMessage();
        chatMessage.setProject(project);
        chatMessage.setSender(sender);
        chatMessage.setMessage(message);
        chatMessage.setMessageType(type);
        return chatRepo.save(chatMessage);
    }
}
