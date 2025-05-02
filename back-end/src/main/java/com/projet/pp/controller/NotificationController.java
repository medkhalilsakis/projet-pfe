package com.projet.pp.controller;

import com.projet.pp.dto.NotificationDTO;
import com.projet.pp.model.User;
import com.projet.pp.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    @Autowired
    NotificationService notifSvc;

    @GetMapping("/{userId}")
    public ResponseEntity<List<NotificationDTO>> listFor(
            @PathVariable Long userId
    ) {
        List<NotificationDTO> list = notifSvc.listFor(userId);
        return ResponseEntity.ok(list);
    }

    /** Marque comme lue */
    @PostMapping("/{userId}/{id}/read")
    public ResponseEntity<Void> markRead(
            @PathVariable Long userId,
            @PathVariable Long id
    ) {
        // Optionnel : vérifier que la notification appartient bien à userId
        notifSvc.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}