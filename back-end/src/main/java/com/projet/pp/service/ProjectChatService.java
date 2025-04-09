package com.projet.pp.service;

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

    public List<ProjectChatMessage> getMessagesByProjectId(Long projectId) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        return chatRepo.findByProject(project);
    }

    @Transactional
    public ProjectChatMessage sendMessage(Long projectId, Long senderId, String message) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet non trouvé"));
        User sender = userRepo.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        ProjectChatMessage chatMessage = new ProjectChatMessage();
        chatMessage.setProject(project);
        chatMessage.setSender(sender);
        chatMessage.setMessage(message);
        // createdAt est défini dans le constructeur
        return chatRepo.save(chatMessage);
    }
}
