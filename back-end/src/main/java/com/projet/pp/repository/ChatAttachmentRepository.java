// src/main/java/com/projet/pp/repository/ChatAttachmentRepository.java
package com.projet.pp.repository;

import com.projet.pp.model.ChatAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

public interface ChatAttachmentRepository extends JpaRepository<ChatAttachment, Long> {
    @Modifying
    @Transactional
    @Query("DELETE FROM ChatAttachment a WHERE a.chatMessage.sender.id = :userId OR a.chatMessage.receiver.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
