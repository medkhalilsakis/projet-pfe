package com.projet.pp.controller;
import com.projet.pp.model.Tache;
import com.projet.pp.model.User;
import com.projet.pp.service.TacheService;
import com.projet.pp.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@RestController
@RequestMapping("/api/taches")
@CrossOrigin(origins = "*") // Allow frontend access, configure as needed
public class TacheController {

    @Autowired
    private TacheService tacheService;
    @Autowired
    private UserService userService;
    private final Path baseStorage = Paths.get("uploads/taches/").toAbsolutePath().normalize();

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
    public ResponseEntity<?> createTache(@RequestPart("task") Map<String, String> taskData,
                                             @RequestPart("projectDetails") MultipartFile projectDetails,
                                             @RequestPart("testCases") MultipartFile testCasesPdf) {
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
        String deadlineStr = taskData.get("deadline");
        //String projectDetailsPdfFilename = taskData.get("projectDetails");
        //String testCasesPdfFilename = taskData.get("testCases");


        if (name == null || description == null || outils == null || assignedToStr == null || assignedByStr == null || statusStr == null || creationDateStr == null || deadlineStr == null|| projectDetails == null || testCasesPdf == null) {
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
            String projectDetailsPdfFilename = null;
            String testCasesPdfFilename = null;
            Files.createDirectories(baseStorage);


            Tache tache = new Tache(
                    null,
                    name,
                    description,
                    deadline,
                    outils,
                    creationDate,
                    status,
                    assignedTo,
                    assignedBy,
                    null,
                    null,
                    null
            );

            // Save the task to get the generated ID
            Tache createdTache = tacheService.createTache(tache);
            Long tacheId = createdTache.getId();

            // Create folder for this task
            Files.createDirectories(baseStorage);
            Path taskFolder = baseStorage.resolve(tacheId.toString());
            Files.createDirectories(taskFolder);

            // Save files
            String projectDetailsPath = "uploads/taches/" + tacheId + "/projectDetails.pdf";
            String testCasesPath = "uploads/taches/" + tacheId + "/testCases.pdf";

            Files.copy(projectDetails.getInputStream(), taskFolder.resolve("projectDetails.pdf"), StandardCopyOption.REPLACE_EXISTING);
            Files.copy(testCasesPdf.getInputStream(), taskFolder.resolve("testCases.pdf"), StandardCopyOption.REPLACE_EXISTING);

            // Update the task with file paths
            createdTache.setProjectDetailsPdf(projectDetailsPath);
            createdTache.setTestCasesPdf(testCasesPath);
            tacheService.createTache(createdTache);  // Update the DB

            return ResponseEntity.status(HttpStatus.CREATED).body(createdTache);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating task: " + e.getMessage());
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
    @GetMapping("/download")
    public ResponseEntity<Resource> downloadFile(@RequestParam String filePath) {
        System.out.println("Downloading file: " + filePath);
        try {
            // Normalize the path to prevent directory traversal
            String normalizedPath = filePath.replace("../", "").replace("..\\", "");

            // Construct the full path
            Path path = Paths.get("uploads", normalizedPath).normalize().toAbsolutePath();

            // Verify the path is within the expected directory
            if (!path.startsWith(Paths.get("uploads").toAbsolutePath())) {
                return ResponseEntity.badRequest().body(null);
            }

            Resource resource = new UrlResource(path.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            if (!resource.isReadable()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + resource.getFilename() + "\"")
                    .header("Access-Control-Allow-Origin", "*")
                    .header("Access-Control-Expose-Headers", "Content-Disposition")
                    .body(resource);
        } catch (IOException e) {
            System.err.println(e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
