package com.projet.pp.controller;

import com.projet.pp.model.Tache;
import com.projet.pp.service.TacheService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/taches")
@CrossOrigin(origins = "*")
public class TacheController {

    @Autowired
    private TacheService tacheService;

    /**
     * Liste toutes les tâches, avec trois filtres optionnels :
     * - q          : recherche textuelle sur le nom
     * - status     : filter par statut (a_developper, en_test, etc.)
     * - assignedTo : filter par ID d'utilisateur assigné
     */
    @GetMapping
    public List<Tache> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Tache.Status status,
            @RequestParam(required = false) Long assignedTo
    ) {
        return tacheService.search(q, status, assignedTo);
    }

    /**
     * Récupère une tâche par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Tache> getById(@PathVariable Long id) {
        return tacheService.getTacheById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Création d’une nouvelle tâche.
     * Doit être envoyé en multipart/form-data avec :
     * - data        : JSON sérialisé des champs (name, description, outils, creationDate, deadline, status, assignedBy, assignedTo)
     * - projectPdf  : le PDF principal (cahier des charges)
     * - attachments : (optionnel) autres pièces jointes
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Tache> create(
            @RequestPart("data") Map<String, String> data,
            @RequestPart("projectPdf") MultipartFile projectPdf,
            @RequestPart(name = "attachments", required = false) MultipartFile[] attachments
    ) throws IOException {
        Tache created = tacheService.create(data, projectPdf, attachments);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Supprime une tâche existante.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tacheService.deleteTache(id);
        return ResponseEntity.noContent().build();
    }
}
