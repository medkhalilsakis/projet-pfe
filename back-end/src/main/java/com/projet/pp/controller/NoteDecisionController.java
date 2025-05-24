package com.projet.pp.controller;

import com.projet.pp.model.NoteDecision;
import com.projet.pp.service.NoteDecisionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes-decisions")
public class NoteDecisionController {

    private final NoteDecisionService service;

    @Autowired
    public NoteDecisionController(NoteDecisionService service) {
        this.service = service;
    }

    @GetMapping
    public List<NoteDecision> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoteDecision> getById(@PathVariable Integer id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public NoteDecision create(@RequestBody NoteDecision note) {
        return service.create(note);
    }

    @PutMapping("/{id}")
    public NoteDecision update(
            @PathVariable Integer id,
            @RequestBody NoteDecision note
    ) {
        return service.update(id, note);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}