package com.projet.pp.repository;

import com.projet.pp.model.ProjectChatAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectChatAttachmentRepository extends JpaRepository<ProjectChatAttachment, Long> {
    List<ProjectChatAttachment> findByChatMessageId(Long messageId);
}