// TestScenarioRepository.java
package com.projet.pp.repository;

import com.projet.pp.model.TestScenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestScenarioRepository extends JpaRepository<TestScenario, Long> {
}
