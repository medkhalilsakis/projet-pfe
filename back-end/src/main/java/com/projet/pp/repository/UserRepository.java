package com.projet.pp.repository;

import com.projet.pp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);         // ← Ajouté pour reset password

    List<User> findByUsernameContainingIgnoreCase(String query);

    List<User> findByRoleId(Long roleId);

}
