package com.projet.pp.repository;


import com.projet.pp.model.ChatMessage;
import com.projet.pp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findBySenderIdAndReceiverId(Long senderId, Long receiverId);
}
