package com.projet.pp.repository;

import com.projet.pp.model.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting,Long> {
    List<Meeting> findByProjectId(Long projectId);
    @Query(value = "SELECT * FROM meeting m JOIN meeting_participants_ids p ON m.id = p.meeting_id WHERE p.participants_ids = :userId", nativeQuery = true)
    List<Meeting> findByParticipantId(@Param("userId") Long userId);

}
