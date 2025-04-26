package com.projet.pp.service;

import com.projet.pp.model.User;
import com.projet.pp.model.UserProfileImage;
import com.projet.pp.repository.UserProfileImageRepository;
import com.projet.pp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;
import java.util.stream.Stream;

@Service
public class UserProfileImageService {

    @Autowired private UserRepository userRepo;
    @Autowired private UserProfileImageRepository imgRepo;

    // dossier de base pour stocker les images
    private final Path base = Paths.get("uploads/users").toAbsolutePath().normalize();

    @Transactional
    public UserProfileImage upload(Long userId, MultipartFile file) throws IOException {
        // 1) récupérer l'utilisateur
        User u = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // 2) créer le répertoire userId
        Path userDir = base.resolve(userId.toString());
        Files.createDirectories(userDir);

        // 3) supprimer toutes les anciennes images dans userDir
        try (Stream<Path> oldFiles = Files.list(userDir)) {
            oldFiles
                    .filter(Files::isRegularFile)
                    .forEach(p -> { try { Files.deleteIfExists(p); } catch (IOException ignore) {} });
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename();
        String extension = "";

        // extraire l’extension
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf('.')).toLowerCase();
        }

        Path target;
        String mimeType;
        long fileSize;

        if ("image/gif".equalsIgnoreCase(contentType)) {
            // **GIF** → aucun crop, on sauvegarde tel quel
            String fn = UUID.randomUUID() + extension;  // .gif
            target = userDir.resolve(fn);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            mimeType = contentType;
            fileSize = Files.size(target);

        } else {
            // **PNG/JPEG/...** → on crop en carré centré et convertit en PNG
            BufferedImage original = ImageIO.read(file.getInputStream());
            if (original == null) {
                throw new IOException("Le fichier n'est pas une image valide");
            }
            int width  = original.getWidth();
            int height = original.getHeight();
            int size   = Math.min(width, height);
            int x = (width  - size) / 2;
            int y = (height - size) / 2;
            BufferedImage cropped = original.getSubimage(x, y, size, size);

            String fn = UUID.randomUUID() + ".png";
            target = userDir.resolve(fn);
            ImageIO.write(cropped, "png", target.toFile());

            mimeType = "image/png";
            fileSize = Files.size(target);
        }

        // 4) mettre à jour (ou créer) l'entité UserProfileImage
        UserProfileImage img = imgRepo.findByUserId(userId)
                .orElse(new UserProfileImage());
        img.setUser(u);
        img.setFilePath(target.toString());
        img.setMimeType(mimeType);
        img.setFileSize(fileSize);
        return imgRepo.save(img);
    }

    public UserProfileImage getMeta(Long userId) {
        return imgRepo.findByUserId(userId).orElse(null);
    }
}