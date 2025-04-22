// src/main/java/com/projet/pp/repository/UserProfileImageRepository.java
package com.projet.pp.repository;

import com.projet.pp.model.UserProfileImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserProfileImageRepository extends JpaRepository<UserProfileImage, Long> {
    Optional<UserProfileImage> findByUserId(Long userId);
}
