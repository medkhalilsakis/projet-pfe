
// src/main/java/com/projet/pp/repository/TacheAttachmentRepository.java
package com.projet.pp.repository;

import com.projet.pp.model.TacheAttachment;
import com.projet.pp.model.TestAssignmentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TestAssignmentAttachmentRepository extends JpaRepository<TestAssignmentAttachment, Long> {
TestAssignmentAttachment findByFilePath(String filePath);
}