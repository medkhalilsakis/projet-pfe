package com.projet.pp.repository;
import com.projet.pp.model.User;

import com.projet.pp.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Notification> findByUser(User user);
    @Query("SELECT n FROM Notification n WHERE n.user = :user AND n.isRead = false")
    List<Notification> findUnreadByUser(@Param("user") User user);

    int deleteByMeeting_Id(Long meetingId);
}
