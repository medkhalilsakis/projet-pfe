// src/main/java/com/projet/pp/service/ProjectChatService.java
package com.projet.pp.service;

import com.projet.pp.dto.ProjectChatMessageDTO;
import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectChatAttachment;
import com.projet.pp.model.ProjectChatMessage;
import com.projet.pp.model.User;
import com.projet.pp.repository.ProjectChatAttachmentRepository;
import com.projet.pp.repository.ProjectChatMessageRepository;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.*;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectChatService {
    @Autowired private ProjectChatMessageRepository msgRepo;
    @Autowired private ProjectChatAttachmentRepository attRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private UserRepository userRepo;

    private final Path base = Paths.get("uploads/project-chats").toAbsolutePath();
    private final DateTimeFormatter fmt = DateTimeFormatter.ISO_DATE_TIME;

    public ProjectChatService() throws Exception {
        Files.createDirectories(base);
    }


    @Transactional(readOnly = true)
    public List<ProjectChatMessageDTO> listMessages(Long projectId) {
        return msgRepo.findByProjectIdOrderByCreatedAtAsc(projectId)
                .stream()
                .map(msg -> {
                    // construction inline du DTO
                    ProjectChatMessageDTO dto = new ProjectChatMessageDTO();
                    dto.setId(msg.getId());
                    dto.setMessage(msg.getMessage());
                    dto.setCreatedAt(msg.getCreatedAt().toString());
                    dto.setSender(new ProjectChatMessageDTO.SenderDTO(
                            msg.getSender().getId(),
                            msg.getSender().getPrenom(),
                            msg.getSender().getNom()
                    ));
                    dto.setAttachments(
                            msg.getAttachments().stream()
                                    .map(att -> {
                                        ProjectChatMessageDTO.AttachmentDTO a = new ProjectChatMessageDTO.AttachmentDTO();
                                        a.setId(att.getId());
                                        a.setFileName(att.getFileName());
                                        a.setMimeType(att.getMimeType());
                                        return a;
                                    })
                                    .collect(Collectors.toList())
                    );
                    return dto;
                })
                .collect(Collectors.toList());
    }
    public List<ProjectChatMessageDTO> listHistory(Long projectId) {
        return msgRepo.findByProjectIdOrderByCreatedAtAsc(projectId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ProjectChatMessageDTO postMessage(Long projectId,
                                             Long senderId,
                                             String text,
                                             MultipartFile[] files) throws Exception {
        Project p = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        User u = userRepo.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        ProjectChatMessage m = new ProjectChatMessage();
        m.setProject(p);
        m.setSender(u);
        m.setMessage(text);
        m = msgRepo.save(m);

        Path dir = base.resolve(projectId.toString()).resolve(m.getId().toString());
        Files.createDirectories(dir);

        if (files != null) {
            for (MultipartFile f : files) {
                Path tgt = dir.resolve(f.getOriginalFilename());
                f.transferTo(tgt);
                ProjectChatAttachment att = ProjectChatAttachment.builder()
                        .fileName(f.getOriginalFilename())
                        .filePath(tgt.toString())
                        .mimeType(f.getContentType())
                        .chatMessage(m)
                        .build();
                attRepo.save(att);
            }
        }

        return toDto(m);
    }

    private ProjectChatMessageDTO toDto(ProjectChatMessage m) {
        var dto = ProjectChatMessageDTO.builder()
                .id(m.getId())
                .message(m.getMessage())
                .createdAt(m.getCreatedAt().format(fmt))
                .sender(new ProjectChatMessageDTO.SenderDTO(
                        m.getSender().getId(),
                        m.getSender().getPrenom(),
                        m.getSender().getNom()))
                .attachments(attRepo.findByChatMessageId(m.getId())
                        .stream()
                        .map(a -> new ProjectChatMessageDTO.AttachmentDTO(
                                a.getId(), a.getFileName(), a.getMimeType()))
                        .collect(Collectors.toList()))
                .build();
        return dto;
    }

    /** Pour servir les pièces jointes en GET */
    public UrlResource loadAttachment(Long attachmentId) throws Exception {
        ProjectChatAttachment att = attRepo.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        return new UrlResource(Paths.get(att.getFilePath()).toUri());
    }


    @Transactional
    public void deleteMessage(Long messageId) {
        msgRepo.deleteById(messageId);
    }

    @Transactional
    public void deleteAttachment(Long attachmentId) {
        attRepo.deleteById(attachmentId);
    }
}
