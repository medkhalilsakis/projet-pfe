package com.projet.pp.controller;

import com.projet.pp.model.Tache;
import com.projet.pp.model.User;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import com.projet.pp.service.TacheService;
import com.projet.pp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/taches")
@CrossOrigin(origins = "*") // Allow frontend access, configure as needed
public class TacheController {

    @Autowired
    private TacheService tacheService;
    @Autowired
    private UserService userService;

    @GetMapping
    public List<Tache> getAllTaches() {
        return tacheService.getAllTaches();
    }

    @GetMapping("/user/{userId}")
    public List<Tache> getTachesByUserId(@PathVariable Long userId) {
        return tacheService.getTachesByUserId(userId);
    }

    @GetMapping("/{id}")
    public Optional<Tache> getTacheById(@PathVariable Long id) {
        return tacheService.getTacheById(id);
    }
    @PostMapping("/create")
    public ResponseEntity<Tache> createTache(@RequestBody Map<String, String> taskData) {
        if (taskData == null || taskData.isEmpty()) {
            // Log the empty request
            System.err.println("Received empty request");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        System.out.println("Received task data: " + taskData);

        String name = taskData.get("name");
        String description = taskData.get("description");
        String outils = taskData.get("outils");
        String assignedToStr = taskData.get("assignedTo");
        String assignedByStr = taskData.get("assignedBy");
        String statusStr = taskData.get("status");
        String creationDateStr = taskData.get("creationDate");
        String deadlineStr = taskData.get("Deadline");

        if (name == null || description == null || outils == null || assignedToStr == null || assignedByStr == null || statusStr == null || creationDateStr == null || deadlineStr == null) {
            // Log missing data
            System.err.println("Missing required fields in task data");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        try {
            Long assignedToId = Long.parseLong(assignedToStr);
            Long assignedById = Long.parseLong(assignedByStr);
            LocalDate creationDate = LocalDate.parse(creationDateStr);
            LocalDate deadline = LocalDate.parse(deadlineStr);

            User assignedTo = userService.getUserById(assignedToId);
            User assignedBy = userService.getUserById(assignedById);

            // Handle status enum parsing
            Tache.Status status;
            try {
                status = Tache.Status.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                // Log invalid status value
                System.err.println("Invalid status value: " + statusStr);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            Tache tache = new Tache(null , name, description, deadline, outils, creationDate, status, assignedTo, assignedBy);
            Tache createdTache = tacheService.createTache(tache);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTache);

        } catch (NumberFormatException | DateTimeParseException e) {
            // Log parsing errors
            System.err.println("Error parsing input data: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public void deleteTache(@PathVariable Long id) {
        tacheService.deleteTache(id);
    }

    // DTO for creating task
    public static class TacheCreationRequest {
        private Tache tache;
        private Long assignedUserId;

        public Tache getTache() {
            return tache;
        }

        public void setTache(Tache tache) {
            this.tache = tache;
        }

        public Long getAssignedUserId() {
            return assignedUserId;
        }

        public void setAssignedUserId(Long assignedUserId) {
            this.assignedUserId = assignedUserId;
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateTaskStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statusStr = body.get("status");

        if (statusStr == null) {
            return ResponseEntity.badRequest().body("Status is required");
        }

        Optional<Tache> optionalTache = tacheService.getTacheById(id);
        if (optionalTache.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found");
        }

        try {
            Tache.Status newStatus = Tache.Status.valueOf(statusStr);
            Tache tache = optionalTache.get();
            tache.setStatus(newStatus);
            tacheService.createTache(tache); // or use `updateTache()` if you have one
            return ResponseEntity.ok(tache);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value");
        }
    }

}
