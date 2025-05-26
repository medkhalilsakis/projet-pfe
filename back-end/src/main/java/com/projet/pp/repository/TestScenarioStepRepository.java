package com.projet.pp.repository;

import com.projet.pp.model.TestScenarioStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TestScenarioStepRepository extends JpaRepository<TestScenarioStep, Long> {
}
