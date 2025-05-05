package com.projet.pp.controller;

import com.projet.pp.model.BugReport;
import com.projet.pp.model.Project;
import com.projet.pp.repository.BugReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{pid}/bugs")
public class BugReportController {
    @Autowired
    BugReportRepository repo;
    @PostMapping
    BugReport report(
            @PathVariable Long pid, @RequestBody BugReport br) {
        br.setProject(new Project(pid)); return repo.save(br);
    }
    @GetMapping List<BugReport> list(@PathVariable Long pid) {
        return repo.findAll().stream()
                .filter(b -> b.getProject().getId().equals(pid))
                .collect(Collectors.toList());
    }
}
