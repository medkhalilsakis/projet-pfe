// src/main/java/com/projet/pp/repository/TacheAttachmentRepository.java
package com.projet.pp.repository;

import com.projet.pp.model.TacheAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TacheAttachmentRepository extends JpaRepository<TacheAttachment, Long> {
    // méthodes CRUD héritées de JpaRepository
}
