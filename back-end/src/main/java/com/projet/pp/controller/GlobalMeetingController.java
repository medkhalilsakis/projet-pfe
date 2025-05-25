package com.projet.pp.controller;

import com.projet.pp.dto.MeetingRequest;
import com.projet.pp.model.Meeting;
import com.projet.pp.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/meetings")
public class GlobalMeetingController {
    @Autowired
    private MeetingService svc;

    /** Planifier sans projet (déjà OK) */
    @PostMapping(
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<Meeting> scheduleNoProject(
            @RequestPart("data") MeetingRequest data,
            @RequestPart(name="attachments", required=false) MultipartFile[] files
    ) throws IOException {
        Meeting saved = svc.scheduleNoProject(data, files);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /** Récupérer une réunion par son ID (globale ou attachée à un projet) */
    @GetMapping(path = "/{mid}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Meeting> getById(@PathVariable("mid") Long meetingId) {
        return svc.findById(meetingId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Mettre à jour une réunion (PATCH) */
    @PatchMapping(path = "/{mid}", consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Meeting> update(
            @PathVariable("mid") Long meetingId,
            @RequestBody MeetingRequest data  // ou un DTO dédié aux patchs
    ) {
        try {
            Meeting updated = svc.update(meetingId, data);
            return ResponseEntity.ok(updated);
        } catch (NoSuchElementException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Supprimer (annuler) une réunion */
    @DeleteMapping("/{mid}")
    public ResponseEntity<Void> delete(@PathVariable("mid") Long meetingId) {
        if (!svc.existsById(meetingId)) {
            return ResponseEntity.notFound().build();
        }
        svc.deleteById(meetingId);
        return ResponseEntity.noContent().build();
    }
}
