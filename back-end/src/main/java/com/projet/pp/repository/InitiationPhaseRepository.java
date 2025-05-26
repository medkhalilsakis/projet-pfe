package com.projet.pp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.projet.pp.model.InitiationPhase;

import java.util.Optional;

@Repository
public interface InitiationPhaseRepository extends JpaRepository<InitiationPhase, Long> {

    boolean existsByTache_Id(Long tacheId);
    Optional<InitiationPhase> findByTache_Id(Long tacheId);

}