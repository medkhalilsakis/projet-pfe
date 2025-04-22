// src/main/java/com/projet/pp/service/UserProfileImageService.java
package com.projet.pp.service;

import com.projet.pp.model.User;
import com.projet.pp.model.UserProfileImage;
import com.projet.pp.repository.UserProfileImageRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class UserProfileImageService {

    @Autowired private UserRepository userRepo;
    @Autowired private UserProfileImageRepository imgRepo;

    private final Path base = Paths.get("uploads/users").toAbsolutePath().normalize();

    @Transactional
    public UserProfileImage upload(Long userId, MultipartFile file) throws IOException {
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Files.createDirectories(base.resolve(userId.toString()));
        String fn = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path target = base.resolve(userId.toString()).resolve(fn);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        UserProfileImage img = imgRepo.findByUserId(userId)
                .orElse(new UserProfileImage());
        img.setUser(u);
        img.setFilePath(target.toString());
        img.setMimeType(file.getContentType());
        img.setFileSize(file.getSize());
        return imgRepo.save(img);
    }

    public UserProfileImage getMeta(Long userId) {
        return imgRepo.findByUserId(userId)
                .orElse(null);
    }
}
