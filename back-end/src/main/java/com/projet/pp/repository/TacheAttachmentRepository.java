// src/main/java/com/projet/pp/repository/TacheAttachmentRepository.java
package com.projet.pp.repository;

import com.projet.pp.model.TacheAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TacheAttachmentRepository extends JpaRepository<TacheAttachment, Long> {
    // méthode pour récupérer le PDF principal
    Optional<TacheAttachment> findByTache_IdAndFileType(Long tacheId, String fileType);

    // méthode pour récupérer toutes les pièces jointes d'une tâche
    List<TacheAttachment> findByTache_Id(Long tacheId);
}