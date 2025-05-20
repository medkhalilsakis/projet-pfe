// src/main/java/com/example/demo/controller/ComplaintController.java
package com.projet.pp.controller;

import com.projet.pp.model.*;
import com.projet.pp.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
public class ComplaintController {
    @Autowired
    private  ComplaintService complaintService;
    @Autowired
    private ProjectService projectService;
    @Autowired
    private PauseRequestService pauseRequestService;
    @Autowired
    private UserService userService;
    @Autowired
    private NotificationService notificationService;
    @Autowired
    private  ProjectPauseService projectPauseService;


    @PostMapping
    public ResponseEntity<Complaint> createComplaint(@RequestBody Map<String, String> body) {
        Long userId = Long.valueOf(body.get("complainerId"));
        Long pauseProjectId = Long.valueOf(body.get("pausedProjectId")); // Par exemple: "pending", "accepted", etc.
        String reason =body.get("reason");
        String details =body.get("details");
        LocalDateTime now =LocalDateTime.now();
        ProjectPause projectPause=projectPauseService.getById(pauseProjectId).orElse(null);
            System.out.println("pauseRequest null");
            Long supervisorId = projectPause.getSupervisor().getId();
            Long projectId = projectPause.getProject().getId();
            Complaint complaint = new Complaint(
                    projectId,
                    supervisorId,
                    userId,
                    reason,
                    details
            );
            System.out.println("complaint  " + complaint);
            Project p =projectPause.getProject();
            Notification noti = new Notification(
                    null,
                    userService.getUserById(supervisorId),
                    "une nouvelle reclamation",
                    " vous avez reçu une nouvelle reclamation pour le proket que vous avez suspendu " + p.getName(),
                    false,
                    now,
                    p,
                    null,
                    null,
                    null
            );
            notificationService.createNoti(noti);
            return ResponseEntity.ok(complaintService.saveComplaint(complaint));


    }

    @GetMapping
    public List<Complaint> getAllComplaints() {
        return complaintService.getAllComplaints();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Complaint> getComplaintById(@PathVariable Long id) {
        return complaintService.getComplaintById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/project/{projectId}")
    public List<Complaint> getComplaintsByProjectId(@PathVariable Long projectId) {
        return complaintService.getComplaintsByProjectId(projectId);
    }
    @GetMapping("/stats")
    public ResponseEntity<Long> getSats(){
        return ResponseEntity.ok(complaintService.getCount());
    }
}
