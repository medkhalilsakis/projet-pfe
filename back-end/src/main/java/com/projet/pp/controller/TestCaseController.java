package com.projet.pp.controller;

import com.projet.pp.model.Project;
import com.projet.pp.model.TestCase;
import com.projet.pp.service.TestCaseService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{pid}/test-cases")
public class TestCaseController {

    @Autowired
    private TestCaseService svc;

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(
            @PathVariable Long pid,
            @RequestBody TestCase tc
    ) {
        try {
            TestCase saved = svc.create(pid, tc);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> exists(
            @PathVariable Long pid,
            @RequestParam String caseNumber
    ) {
        boolean exists = svc.existsByProjectAndCaseNumber(pid, caseNumber);
        return ResponseEntity.ok(exists);
    }


    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TestCase>> list(@PathVariable Long pid) {
        return ResponseEntity.ok(svc.findByProject(pid));
    }

    @GetMapping("/project/{projId}/count")
    public long countByProject(@PathVariable Long projId) {
        return svc.countByProject(projId);
    }


    @PutMapping(value = "/{tcId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> update(
            @PathVariable Long pid,
            @PathVariable Long tcId,
            @RequestBody TestCase tc
    ) {
        try {
            TestCase updated = svc.update(pid, tcId, tc);
            return ResponseEntity.ok(updated);
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", ex.getMessage()));
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", ex.getMessage()));
        }
    }


    @DeleteMapping("/{tcId}")
    public ResponseEntity<Void> delete(
            @PathVariable("pid") Long projectId,
            @PathVariable("tcId") Long tcId
    ) {
        try {
            svc.delete(projectId, tcId);
            return ResponseEntity.noContent().build();
        } catch (EntityNotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}
