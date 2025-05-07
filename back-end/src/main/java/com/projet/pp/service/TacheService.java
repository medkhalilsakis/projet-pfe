package com.projet.pp.service;

import com.projet.pp.model.Project;
import com.projet.pp.model.Tache;
import com.projet.pp.model.User;
import com.projet.pp.model.TestStatus;
import com.projet.pp.repository.TacheRepository;
import com.projet.pp.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TacheService {

    @Autowired
    private TacheRepository tacheRepository;

    @Autowired
    private UserRepository userRepository;

    private final Path baseStorage = Paths.get("uploads/pdfFiles").toAbsolutePath().normalize();


    public List<Tache> getAllTaches() {
        return tacheRepository.findAll();
    }

    public List<Tache> getTachesByUserId(Long userId) {
        Optional<User> user = userRepository.findById(userId);
        return user.map(tacheRepository::findByAssignedTo).orElse(null);
    }

    public Tache createTache(Tache tache) {

        return tacheRepository.save(tache);
    }
    public User getAssignedBy(Long tacheId) {
        return tacheRepository.findById(tacheId)
                .map(Tache::getAssignedBy)
                .orElse(null);
    }
    public Optional<Tache> getTacheByProjectId(Long id) {
        return tacheRepository.findByProject_Id(id);
    }


    public Optional<Tache> getTacheById(Long id) {
        return tacheRepository.findById(id);
    }

    public void deleteTache(Long id) {
        tacheRepository.deleteById(id);
    }

    public void linkTaskToProject(Long taskId, Project project) {
        Tache task = tacheRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found with id: " + taskId));

        task.setProject(project); // Update the task's project reference
        tacheRepository.save(task);
    }
    public long getByStatus(Tache.Status status) {
        return tacheRepository.countByStatus(status);
    }public long getByStatusAndAssignedTo(Long id, Tache.Status status) {
        User assignedTo=userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Developer not found with id: " + id));

        return tacheRepository.countByStatusAndAssignedTo(status,assignedTo);
    }

}
