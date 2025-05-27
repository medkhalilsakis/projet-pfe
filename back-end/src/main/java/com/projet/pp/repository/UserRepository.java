package com.projet.pp.repository;

import com.projet.pp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);         // ← Ajouté pour reset password
//fix this below
    List<User> findByUsernameContainingIgnoreCase(String query);
    @Query("SELECT u FROM User u WHERE u.role.id = :roleId  AND NOT (u.nom = 'user' AND u.prenom = 'deleted')")
    List<User> findAllActiveByRoleId(Long roleId);
    @Query("SELECT u FROM User u WHERE NOT (u.nom = 'user' AND u.prenom = 'deleted')")
        List<User> findAllActiveUsers();


    @Query("""
      SELECT u
      FROM User u
      WHERE NOT (u.nom = 'user' AND u.prenom = 'deleted')
        AND u.id <> :ownerId
        AND u.id NOT IN (
          SELECT pi.user.id
          FROM ProjectInvitedUser pi
          WHERE pi.project.id = :projectId
        )
    """)
    List<User> findInviteableUsers(
            @Param("projectId") Long projectId,
            @Param("ownerId"  ) Long ownerId
    );
}
