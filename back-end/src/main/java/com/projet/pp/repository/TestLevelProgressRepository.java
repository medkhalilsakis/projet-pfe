package com.projet.pp.repository;


import com.projet.pp.model.TestLevelProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TestLevelProgressRepository extends JpaRepository<TestLevelProgress,Long> {
    List<TestLevelProgress> findByProjectIdAndTesterId(Long projectId, Long testerId);
}
