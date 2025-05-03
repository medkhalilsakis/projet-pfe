package com.projet.pp.repository;

import com.projet.pp.model.User;
import com.projet.pp.model.Tache;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {
    List<Tache> findByNameContainingIgnoreCase(String q);
    List<Tache> findByStatus(Tache.Status status);
    List<Tache> findByAssignedToId(Long userId);
    List<Tache> findByNameContainingIgnoreCaseAndStatusAndAssignedToId(String q, Tache.Status status, Long userId);
    List<Tache> findByProjectIsNull();


    @Modifying
    @Transactional
    @Query("""
    UPDATE Tache t
    SET t.assignedBy = (SELECT u FROM User u WHERE u.id = 0)
    WHERE t.assignedBy.id = :userId
    """)
    void reassignDeletedCreator(@Param("userId") Long userId);

    @Modifying
    @Transactional
    @Query(nativeQuery = true,
            value = "DELETE FROM tache_assigne ta WHERE ta.user_id = :userId")
    void deleteUserFromAssignedTo(@Param("userId") Long userId);
}
