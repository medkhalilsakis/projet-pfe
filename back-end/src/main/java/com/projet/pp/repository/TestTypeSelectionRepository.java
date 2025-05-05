package com.projet.pp.repository;

import com.projet.pp.model.TestTypeSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface TestTypeSelectionRepository extends JpaRepository<TestTypeSelection,Long> {
    List<TestTypeSelection> findByProjectIdAndTesterId(Long projectId, Long testerId);
    @Modifying
    @Transactional
    @Query("DELETE FROM TestTypeSelection t WHERE t.project.id=:pid AND t.tester.id=:tid")
    void deleteByProjectAndTester(@Param("pid") Long projectId, @Param("tid") Long testerId);
}
