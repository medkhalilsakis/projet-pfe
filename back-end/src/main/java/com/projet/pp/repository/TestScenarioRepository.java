// TestScenarioRepository.java
package com.projet.pp.repository;

import com.projet.pp.model.TestScenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TestScenarioRepository extends JpaRepository<TestScenario, Long> {
    boolean existsByProject_Id(Long projectId);

    Optional<TestScenario> findByProject_Id(Long projectId);

}
