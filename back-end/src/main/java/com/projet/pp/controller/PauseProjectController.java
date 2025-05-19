package com.projet.pp.controller;

import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectPause;
import com.projet.pp.service.ProjectPauseService;
import com.projet.pp.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects")
public class PauseProjectController {
    @Autowired
    private ProjectPauseService projectPauseService;
@Autowired
private ProjectService projectService;
    @GetMapping("/pause-projects/{userId}")
    public ResponseEntity<List<ProjectPause>> getPausedProjectsByUserId(@PathVariable Long userId) {
// 1) Projects the user owns
        List<Project> owned = projectService.getProjectsByUserId(userId);
        // 2) Projects the user is invited to
        List<Project> invited = projectService.getProjectsByInvitedUserId(userId);

        // 3) Merge them
        List<Project> projects = new ArrayList<>(owned);
        projects.addAll(invited);
        List<ProjectPause> listPause = projectPauseService.getByProjects(projects);
        return ResponseEntity.ok(listPause);
        // TODO: Add implementation logic here
    }


}
