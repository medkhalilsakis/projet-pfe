package com.projet.pp.service;

import com.projet.pp.dto.NoteDecisionDto;
import com.projet.pp.model.NoteDecision;
import com.projet.pp.repository.NoteDecisionRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.StringJoiner;
import java.util.UUID;

@Service
public class NoteDecisionService {

    private final NoteDecisionRepository repo;
    private final UserRepository userRepo;
    private UserService userService;
    private final Path storageDir = Paths.get("uploads/notes")
            .toAbsolutePath().normalize();

    @Autowired
    public NoteDecisionService(
            NoteDecisionRepository repo,
            UserRepository userRepo
    ) throws IOException {
        this.repo     = repo;
        this.userRepo = userRepo;
        Files.createDirectories(storageDir);
    }

    public java.util.List<NoteDecision> findAll() {
        return repo.findAll();
    }

    public Optional<NoteDecision> findById(Integer id) {
        return repo.findById(id);
    }

    @Transactional
    public NoteDecision create(NoteDecisionDto dto, MultipartFile[] files) {
        // 1) Créer l’entité depuis le DTO
        NoteDecision note = NoteDecision.builder()
                .typeNote(dto.getTypeNote())
                .titre(dto.getTitre())
                .contenu(dto.getContenu())
                .statut(dto.getStatut())
                .remarque(dto.getRemarque())
                // dateCreation géré par @CreationTimestamp
                .build();

        // 2) Lier le superviseur si présent (Integer → Long → Optional<User>)
        Optional.ofNullable(dto.getSuperviseurId())
                .map(Integer::longValue)               // conversion int→long
                .flatMap(userRepo::findById)           // Optional<User>
                .ifPresent(note::setSuperviseur);

        // 3) Gérer l’upload des fichiers
        if (files != null && files.length > 0) {
            StringJoiner sj = new StringJoiner(";");
            for (MultipartFile f : files) {
                String ext = Optional.ofNullable(f.getOriginalFilename())
                        .filter(n -> n.contains("."))
                        .map(n -> n.substring(n.lastIndexOf('.')))
                        .orElse("");
                String filename = System.currentTimeMillis()
                        + "_" + UUID.randomUUID() + ext;
                try {
                    Path target = storageDir.resolve(filename);
                    Files.copy(f.getInputStream(), target,
                            StandardCopyOption.REPLACE_EXISTING);
                    sj.add(filename);
                } catch (IOException e) {
                    throw new RuntimeException(
                            "Erreur upload fichier " + f.getOriginalFilename(), e);
                }
            }
            note.setFichierJoint(sj.toString());
        }

        // 4) Sauvegarde en base
        return repo.save(note);
    }

    @Transactional
    public NoteDecision updateFromDto(
            Integer id,
            NoteDecisionDto dto,
            MultipartFile[] files
    ) {
        return repo.findById(id).map(existing -> {
            // 1) Mettre à jour les champs texte
            existing.setTypeNote(dto.getTypeNote());
            existing.setTitre(dto.getTitre());
            existing.setContenu(dto.getContenu());
            existing.setDateModification(LocalDateTime.now());
            existing.setStatut(dto.getStatut());
            existing.setRemarque(dto.getRemarque());
            Optional.ofNullable(dto.getSuperviseurId())
                    .map(Integer::longValue)
                    .flatMap(userRepo::findById)
                    .ifPresent(existing::setSuperviseur);

            // 2) Si on a uploadé de nouveaux fichiers, on supprime d’abord l’ancien(s)
            if (files != null && files.length > 0) {
                // 2.a) Supprimer physiquement les anciens fichiers
                if (existing.getFichierJoint() != null) {
                    for (String oldFilename : existing.getFichierJoint().split(";")) {
                        try {
                            Path oldFile = storageDir.resolve(oldFilename);
                            Files.deleteIfExists(oldFile);
                        } catch (IOException ioe) {
                            // loggez au besoin, mais ne bloquez pas toute l’opé
                            System.err.println("Impossible de supprimer " + oldFilename + " : " + ioe.getMessage());
                        }
                    }
                }
                // 2.b) Stocker les nouveaux fichiers
                StringJoiner sj = new StringJoiner(";");
                for (MultipartFile f : files) {
                    String ext = Optional.ofNullable(f.getOriginalFilename())
                            .filter(n -> n.contains("."))
                            .map(n -> n.substring(n.lastIndexOf('.')))
                            .orElse("");
                    String filename = System.currentTimeMillis()
                            + "_" + UUID.randomUUID()
                            + ext;
                    try {
                        Path target = storageDir.resolve(filename);
                        Files.copy(f.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                        sj.add(filename);
                    } catch (IOException e) {
                        throw new RuntimeException("Erreur upload fichier " + f.getOriginalFilename(), e);
                    }
                }
                // 2.c) Remplacer la liste des anciens noms par les nouveaux
                existing.setFichierJoint(sj.toString());
            }

            // 3) Sauvegarde en base
            return repo.save(existing);
        }).orElseThrow(() ->
                new RuntimeException("NoteDecision non trouvée : " + id)
        );
    }

    public void delete(Integer id) {
        repo.deleteById(id);
    }


    @Transactional
    public NoteDecision createFromDto(
            NoteDecisionDto dto,
            MultipartFile[] files
    ) {
        // 1) Construction de l'entité à partir du DTO
        NoteDecision note = NoteDecision.builder()
                .typeNote(dto.getTypeNote())
                .titre(dto.getTitre())
                .contenu(dto.getContenu())
                .statut(dto.getStatut())
                .remarque(dto.getRemarque())
                // dateCreation sera renseigné par @CreationTimestamp
                .build();

        // 2) Lier le superviseur (si présent)
        if (dto.getSuperviseurId() != null) {
            userService.getUserByIdOptional(dto.getSuperviseurId())
                    .ifPresent(note::setSuperviseur);
        }

        // 3) Gérer l’upload des fichiers joints
        if (files != null && files.length > 0) {
            StringJoiner joiner = new StringJoiner(";");
            for (MultipartFile multipart : files) {
                String original = multipart.getOriginalFilename();
                String ext = (original != null && original.contains("."))
                        ? original.substring(original.lastIndexOf('.'))
                        : "";
                String filename = System.currentTimeMillis()
                        + "_" + UUID.randomUUID()
                        + ext;
                try {
                    Path target = storageDir.resolve(filename);
                    Files.copy(
                            multipart.getInputStream(),
                            target,
                            StandardCopyOption.REPLACE_EXISTING
                    );
                    joiner.add(filename);
                } catch (IOException e) {
                    throw new RuntimeException(
                            "Erreur lors de l’upload de " + original, e
                    );
                }
            }
            note.setFichierJoint(joiner.toString());
        }

        // 4) Sauvegarde en base
        return repo.save(note);
    }

}
