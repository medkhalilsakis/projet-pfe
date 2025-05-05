package com.projet.pp.controller;

import com.projet.pp.service.TestProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects/{pid}/progress")
public class TestProgressController {

    @Autowired
    private TestProgressService svc;

    /**
     * Récupère les types de test déjà sélectionnés pour ce projet et ce testeur.
     *  - pid    : ID du projet (chemin)
     *  - userId : ID du testeur (query param)
     */
    @GetMapping("/types")
    public List<String> getTypes(
            @PathVariable("pid") Long projectId,
            @RequestParam("userId") Long userId
    ) {
        return svc.getTypes(projectId, userId);
    }

    /**
     * Enregistre les types de test sélectionnés.
     *  - pid    : ID du projet (chemin)
     *  - userId : ID du testeur (query param)
     *  - types  : liste des types cochés (body)
     */
    @PostMapping("/types")
    public void saveTypes(
            @PathVariable("pid") Long projectId,
            @RequestParam("userId") Long userId,
            @RequestBody List<String> types
    ) {
        svc.saveTypes(projectId, userId, types);
    }

    /**
     * Récupère l’état d’avancement des niveaux de test.
     *  - pid    : ID du projet (chemin)
     *  - userId : ID du testeur (query param)
     */
    @GetMapping("/levels")
    public Map<String, Boolean> getLevels(
            @PathVariable("pid") Long projectId,
            @RequestParam("userId") Long userId
    ) {
        return svc.getLevels(projectId, userId);
    }

    /**
     * Met à jour un niveau de test (coché ou décoché).
     *  - pid       : ID du projet (chemin)
     *  - userId    : ID du testeur (query param)
     *  - level     : nom du niveau (query param)
     *  - completed : true si coché, false sinon (query param)
     */
    @PostMapping("/levels")
    public void updateLevel(
            @PathVariable("pid") Long projectId,
            @RequestParam("userId") Long userId,
            @RequestParam("level") String level,
            @RequestParam("completed") boolean completed
    ) {
        svc.updateLevel(projectId, userId, level, completed);
    }

}
