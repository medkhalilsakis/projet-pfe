package com.projet.pp.controller;
import com.projet.pp.model.Meeting;
import com.projet.pp.model.Project;
import com.projet.pp.repository.MeetingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{pid}/meetings")
public class MeetingController {
    @Autowired
    MeetingRepository repo;
    @PostMapping
    Meeting schedule(
            @PathVariable Long pid, @RequestBody Meeting m) {
        m.setProject(new Project(pid)); return repo.save(m);
    }
    @GetMapping List<Meeting> list(@PathVariable Long pid) {
        return repo.findAll().stream()
                .filter(mm -> mm.getProject().getId().equals(pid))
                .collect(Collectors.toList());
    }
}
