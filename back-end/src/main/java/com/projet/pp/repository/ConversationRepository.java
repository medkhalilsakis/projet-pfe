package com.projet.pp.repository;

import com.projet.pp.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    @Query("SELECT c FROM Conversation c WHERE c.user1.id = ?1 OR c.user2.id = ?1")
    List<Conversation> findByUserId(Long userId);

    @Query("SELECT c.id FROM Conversation c WHERE (c.user1.id = :user1 AND c.user2.id = :user2) OR (c.user1.id = :user2 AND c.user2.id = :user1)")
    Long findExistingConversation(@Param("user1") Long user1, @Param("user2") Long user2);
}