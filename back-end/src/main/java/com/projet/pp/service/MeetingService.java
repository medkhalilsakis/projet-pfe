// src/main/java/com/projet/pp/service/MeetingService.java
package com.projet.pp.service;

import com.projet.pp.dto.MeetingDto;
import com.projet.pp.dto.MeetingRequest;
import com.projet.pp.model.Meeting;
import com.projet.pp.model.Project;
import com.projet.pp.model.User;
import com.projet.pp.repository.MeetingRepository;
import com.projet.pp.repository.NotificationRepository;
import com.projet.pp.repository.ProjectRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.stream.Collectors;

@Service
public class MeetingService {

    private final Path storageDir = Paths.get("uploads/meetings").toAbsolutePath().normalize();

    @Autowired private MeetingRepository meetingRepo;
    @Autowired private ProjectRepository projectRepo;
    @Autowired private UserRepository userRepo;
    @Autowired private NotificationRepository notificationRepo;

    public MeetingService() throws IOException {
        Files.createDirectories(storageDir);
    }

    public Optional<Meeting> findById(Long meetingId) {
        return meetingRepo.findById(meetingId);
    }


    @Transactional
    public Meeting update(Long meetingId, MeetingRequest req) {
        Meeting m = meetingRepo.findById(meetingId)
                .orElseThrow(() -> new NoSuchElementException("Meeting introuvable"));

        m.setSubject(req.getSubject());
        m.setDate(req.getDate());
        m.setDescription(req.getDescription());

        // → mettre à jour la liste des IDs cochés
        m.setParticipantsIds(req.getParticipantsIds());

        return meetingRepo.save(m);
    }

    public boolean existsById(Long meetingId) {
        return meetingRepo.existsById(meetingId);
    }

    @Transactional
    public void deleteById(Long meetingId) {
        // 1) Charger la réunion (ou échouer si introuvable)
        Meeting m = meetingRepo.findById(meetingId)
                .orElseThrow(() -> new NoSuchElementException("Réunion introuvable pour id=" + meetingId));

        // 2) Supprimer d’abord toutes les notifications liées
        notificationRepo.deleteByMeeting_Id(meetingId);

        // 3) Supprimer physiquement les pièces-jointes
        if (m.getAttachments() != null) {
            for (String filename : m.getAttachments()) {
                try {
                    Path file = storageDir.resolve(filename).normalize();
                    Files.deleteIfExists(file);
                } catch (IOException ex) {
                    // log et continuer
                    System.err.println("Erreur suppression fichier " + filename + ": " + ex.getMessage());
                }
            }
        }

        // 4) Enfin supprimer l’entité Meeting
        meetingRepo.deleteById(meetingId);
    }
    @Transactional
    public Meeting schedule(Long projectId, MeetingRequest req, MultipartFile[] attachments) throws IOException {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Projet introuvable"));
        Meeting m = new Meeting();
        m.setSubject(req.getSubject());
        m.setDate(req.getDate());
        m.setParticipantsIds(req.getParticipantsIds());
        m.setDescription(req.getDescription());
        m.setProject(project);

        // stocker les pièces‑jointes et conserver leurs noms dans l'entity
        List<String> stored = new ArrayList<>();
        if (attachments != null) {
            for (MultipartFile f : attachments) {
                String ext = f.getOriginalFilename().contains(".")
                        ? f.getOriginalFilename().substring(f.getOriginalFilename().lastIndexOf('.'))
                        : "";
                String filename = System.currentTimeMillis() + "_" + java.util.UUID.randomUUID() + ext;
                Path target = storageDir.resolve(filename);
                Files.copy(f.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                stored.add(filename);
            }
        }
        m.setAttachments(stored);
        return meetingRepo.save(m);
    }

    public List<Meeting> findByProject(Long projectId) {
        return meetingRepo.findByProjectId(projectId);
    }

    /** Renvoie la ressource d’une pièce‑jointe */
    public Resource loadAttachment(String filename) {
        try {
            Path file = storageDir.resolve(filename).normalize();
            Resource r = new UrlResource(file.toUri());
            if (r.exists() || r.isReadable()) return r;
            else throw new RuntimeException("Fichier non lisible: " + filename);
        } catch (MalformedURLException e) {
            throw new RuntimeException("URL invalide: " + filename, e);
        }
    }
    public List<Meeting> findByUser(Long userId) {
        return meetingRepo.findByParticipantId(userId);
    }

    public List<MeetingDto> findMeetingsByUser(Long userId) {
        return meetingRepo.findByParticipantId(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private MeetingDto toDto(Meeting m) {
        return new MeetingDto(
                m.getId(),
                m.getSubject(),
                m.getDate(),
                m.getParticipantsIds(),
                m.getAttachments(),
                m.getDescription(),
                m.getProject() != null ? m.getProject().getId() : null
        );
    }

    @Transactional
    public Meeting scheduleNoProject(MeetingRequest req, MultipartFile[] attachments) throws IOException {
        Meeting m = new Meeting();
        m.setSubject(req.getSubject());
        m.setDate(req.getDate());
        m.setParticipantsIds(req.getParticipantsIds());
        m.setDescription(req.getDescription());
        m.setProject(null);  // pas de projet

        // stockage des pièces jointes (copié depuis schedule)
        List<String> stored = new ArrayList<>();
        if (attachments != null) {
            for (MultipartFile f : attachments) {
                String ext = f.getOriginalFilename().contains(".")
                        ? f.getOriginalFilename().substring(f.getOriginalFilename().lastIndexOf('.'))
                        : "";
                String filename = System.currentTimeMillis() + "_" + UUID.randomUUID() + ext;
                Path target = storageDir.resolve(filename);
                Files.copy(f.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                stored.add(filename);
            }
        }
        m.setAttachments(stored);

        return meetingRepo.save(m);
    }

}
