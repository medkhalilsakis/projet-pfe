package com.projet.pp.service;

import com.projet.pp.dto.*;
import com.projet.pp.dto.InitiationPhaseDto;
import com.projet.pp.model.InitiationPhase;
import com.projet.pp.repository.InitiationPhaseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class InitiationPhaseService {

    private final InitiationPhaseRepository repo;

    public InitiationPhaseService(InitiationPhaseRepository repo) {
        this.repo = repo;
    }

    public List<InitiationPhase> findAll() {
        return repo.findAll();
    }

    public Optional<InitiationPhase> findById(Long id) {
        return repo.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<InitiationPhase> findByTacheId(Long tacheId) {
        return repo.findByTache_Id(tacheId);
    }

    @Transactional(readOnly = true)
    public Optional<InitiationPhaseDto> findDtoByTacheId(Long tacheId) {
        return repo.findByTache_Id(tacheId)
                .map(phase -> {
                    InitiationPhaseDto dto = InitiationPhaseDto.builder()
                            .id(phase.getId())
                            .introduction(phase.getIntroduction())
                            .objectifs(phase.getObjectifs())
                            .exigences(phase.getExigences().stream().map(e ->
                                    InitiationPhaseDto.ExigenceDto.builder()
                                            .id(e.getId())
                                            .fonctionnelle(e.getFonctionnelle())
                                            .nonFonctionnelle(e.getNonFonctionnelle())
                                            .priorite(e.getPriorite().name())
                                            .build()
                            ).toList())
                            .faisabilite(Optional.ofNullable(phase.getFaisabilite())
                                    .map(f -> InitiationPhaseDto.AnalyseFaisabiliteDto.builder()
                                            .id(f.getId())
                                            .techniqueDisponible(f.isTechniqueDisponible())
                                            .budgetSuffisant(f.isBudgetSuffisant())
                                            .delaisRealistes(f.isDelaisRealistes())
                                            .ressourcesHumainesSuffisantes(f.isRessourcesHumainesSuffisantes())
                                            .build()
                                    ).orElse(null))
                            .cahierDesCharges(Optional.ofNullable(phase.getCahierDesCharges())
                                    .map(c -> InitiationPhaseDto.CahierDesChargesDto.builder()
                                            .id(c.getId())
                                            .objectifsProjet(c.getObjectifsProjet())
                                            .livrables(c.getLivrables())
                                            .contraintes(c.getContraintes())
                                            .criteresSucces(c.getCriteresSucces())
                                            .build()
                                    ).orElse(null))
                            .plannings(phase.getPlannings().stream().map(p ->
                                    InitiationPhaseDto.PlanificationPhaseDto.builder()
                                            .id(p.getId())
                                            .nomPhase(p.getNomPhase())
                                            .dateDebut(p.getDateDebut().toString())
                                            .dateFin(p.getDateFin().toString())
                                            .budgetEstime(p.getBudgetEstime())
                                            .build()
                            ).toList())
                            .build();
                    return dto;
                });
    }

    @Transactional
    public InitiationPhase save(InitiationPhase phase) {
        // 1) lier chaque exigence à la phase
        if (phase.getExigences() != null) {
            phase.getExigences().forEach(e -> e.setPhase(phase));
        }
        // 2) lier l’analyse de faisabilité
        if (phase.getFaisabilite() != null) {
            phase.getFaisabilite().setPhase(phase);
        }
        // 3) lier le cahier des charges
        if (phase.getCahierDesCharges() != null) {
            phase.getCahierDesCharges().setPhase(phase);
        }
        // 4) lier chaque planification
        if (phase.getPlannings() != null) {
            phase.getPlannings().forEach(p -> p.setPhase(phase));
        }

        // Maintenant que toutes les références inverses sont en place,
        // Hibernate pourra correctement fixer les FK phase_id dans chaque table.
        return repo.save(phase);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public boolean existsForTache(Long tacheId) {
        return repo.existsByTache_Id(tacheId);
    }
}
