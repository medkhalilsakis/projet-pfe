package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.ProjectTesterAssignment;
import com.projet.pp.model.TestStatus;
import com.projet.pp.model.User;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.ProjectTesterAssignmentRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TesterAssignmentService {
    @Autowired
    private ProjectRepository projectRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private ProjectTesterAssignmentRepository assignRepo;

    public List<Project> getPendingProjects() {
        return projectRepo.findByStatus(1);
    }

    public List<User> getAllTesters() {
        return userRepo.findByRoleId(2L);
    }

    public long countInProgress(Long testeurId) {
        return assignRepo.countByTesteurIdAndStatutTest(testeurId, TestStatus.en_cours);
    }

    @Transactional
    public void assignTester(Long projectId, Long testeurId, Long superviseurId) {
        Project p = projectRepo.findById(projectId).orElseThrow();
        User t = userRepo.findById(testeurId).orElseThrow();
        User s = userRepo.findById(superviseurId).orElseThrow();
        int numero = assignRepo.findByProjectId(projectId).size() + 1;
        ProjectTesterAssignment a = new ProjectTesterAssignment();
        a.setProject(p);
        a.setTesteur(t);
        a.setSuperviseur(s);
        a.setNumeroTesteur(numero);
        assignRepo.save(a);
    }
}

