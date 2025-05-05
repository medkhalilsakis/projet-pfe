package com.projet.pp.controller;

import com.projet.pp.model.Project;
import com.projet.pp.model.TestCase;
import com.projet.pp.service.TestCaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{pid}/test-cases")
public class TestCaseController {
    @Autowired
    TestCaseService svc;

    @PostMapping
    public ResponseEntity<TestCase> create(
            @PathVariable Long pid,
            @RequestBody TestCase tc
    ) {
        TestCase saved = svc.create(pid, tc);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping
    public ResponseEntity<List<TestCase>> list(@PathVariable Long pid) {
        return ResponseEntity.ok(svc.findByProject(pid));
    }
}