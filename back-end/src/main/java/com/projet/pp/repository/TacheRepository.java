package com.projet.pp.repository;

import com.projet.pp.model.User;
import com.projet.pp.model.Tache;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface TacheRepository extends JpaRepository<Tache, Long> {
    List<Tache> findByNameContainingIgnoreCase(String q);
    List<Tache> findByStatus(Tache.Status status);
    List<Tache> findByAssignedToId(Long userId);
    List<Tache> findByNameContainingIgnoreCaseAndStatusAndAssignedToId(String q, Tache.Status status, Long userId);
    List<Tache> findByProjectIsNull();
    Optional<Tache> findByProject_Id(Long projectId);

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

    long countByStatus(Tache.Status statut);
    long countByStatusAndAssignedTo(Tache.Status statut, User user);


    @Query("""
      SELECT COUNT(t)
      FROM Tache t 
     JOIN t.assignedTo u 
      WHERE u.id = :devId
        AND t.status NOT IN (com.projet.pp.model.Tache.Status.suspendu, com.projet.pp.model.Tache.Status.cloturé)
    """)
    long countActiveTasks(@Param("devId") Long devId);

    /**
     * Count distinct projects where that dev has tasks
     * whose status is NOT 'suspendu' or 'cloturé'.
     */
    @Query("""
      SELECT COUNT(DISTINCT t.project.id)
      FROM Tache t
      JOIN t.assignedTo u 
      WHERE u.id = :devId
        AND t.status NOT IN (com.projet.pp.model.Tache.Status.suspendu, com.projet.pp.model.Tache.Status.cloturé)
    """)
    long countActiveProjects(@Param("devId") Long devId);
}
