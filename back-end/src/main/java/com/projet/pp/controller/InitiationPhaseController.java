package com.projet.pp.controller;

import com.projet.pp.model.InitiationPhase;
import com.projet.pp.service.InitiationPhaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.List;

@RestController
@RequestMapping("/api/initiation-phases")
@CrossOrigin(origins = "http://localhost:4200")
public class InitiationPhaseController {

    private final InitiationPhaseService service;

    public InitiationPhaseController(InitiationPhaseService service) {
        this.service = service;
    }

    @GetMapping
    public List<InitiationPhase> all() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<InitiationPhase> getOne(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public InitiationPhase create(@RequestBody InitiationPhase phase) {
        return service.save(phase);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InitiationPhase> update(
            @PathVariable Long id,
            @RequestBody InitiationPhase phase
    ) {
        return service.findById(id)
                .map(existing -> {
                    phase.setId(id);
                    return ResponseEntity.ok(service.save(phase));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.findById(id).isPresent()) {
            service.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/exists/{tacheId}")
    public ResponseEntity<Boolean> existsPhaseForTache(
            @PathVariable Long tacheId
    ) {
        boolean exists = service.existsForTache(tacheId);
        return ResponseEntity.ok(exists);
    }
}