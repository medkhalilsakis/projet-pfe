package com.projet.pp.repository;

import com.projet.pp.model.User;
import com.projet.pp.model.Tache;
import com.projet.pp.model.TestStatus;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface TacheRepository extends JpaRepository<Tache, Long> {
    List<Tache> findByAssignedTo(User user);
    List<Tache> findByStatus(Tache.Status statut); // Optional: for 'to develop' or 'to test'
    long countByStatus(Tache.Status statut);
    long countByStatusAndAssignedTo(Tache.Status statut, User user);
    Optional<Tache> findByProject_Id(Long id);


    @Query("""
      SELECT COUNT(t)
      FROM Tache t
      WHERE t.assignedTo.id = :devId
        AND t.status NOT IN ('suspendu', 'cloturé')
    """)
    long countActiveTasks(@Param("devId") Long devId);

    /**
     * Count distinct projects where that dev has tasks
     * whose status is NOT 'suspendu' or 'cloturé'.
     */
    @Query("""
      SELECT COUNT(DISTINCT t.project.id)
      FROM Tache t
      WHERE t.assignedTo.id = :devId
        AND t.status NOT IN ('suspendu', 'cloturé')
    """)
    long countActiveProjects(@Param("devId") Long devId);
}
