package com.projet.pp.controller;

import com.projet.pp.dto.PauseRequestDto;
import com.projet.pp.model.PauseRequest;
import com.projet.pp.model.PauseStatus;
import com.projet.pp.service.PauseRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/projects/{projectId}/pause-requests")
public class PauseRequestController {
    @Autowired private PauseRequestService pauseSvc;

    @PostMapping
    public ResponseEntity<PauseRequestDto> requestPause(
            @PathVariable Long projectId,
            @RequestBody PauseRequestDto dto
    ) {
        if (dto.getRequesterId() == null) {
            return ResponseEntity.badRequest().build();
        }
        PauseRequest pr = pauseSvc.create(projectId, dto.getRequesterId(), dto.getReason());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PauseRequestDto.fromEntity(pr));
    }

    @GetMapping
    public List<PauseRequestDto> list(@PathVariable Long projectId) {
        return pauseSvc.findByProject(projectId)
                .stream()
                .map(PauseRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    /** Traiter (approve/reject) une demande de pause */
    @PutMapping("/{requestId}")
    public ResponseEntity<PauseRequestDto> handleRequest(
            @PathVariable Long projectId,
            @PathVariable Long requestId,
            @RequestBody PauseRequestDto dto
    ) {
        // dto.status doit valoir "APPROVED" ou "REJECTED"
        PauseStatus ps = PauseStatus.valueOf(dto.getStatus());
        PauseRequest pr = pauseSvc.updateStatus(projectId, requestId, ps, dto.getSupervisorId());
        return ResponseEntity.ok(PauseRequestDto.fromEntity(pr));
    }
}
