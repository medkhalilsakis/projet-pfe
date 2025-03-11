package com.projet.pp.service;

import com.projet.pp.model.OTP;
import com.projet.pp.model.User;
import com.projet.pp.repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import org.springframework.transaction.annotation.Transactional;

@Service
public class OtpService {

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private JavaMailSender mailSender;

    // Génère le code OTP, supprime les anciens OTP pour l'utilisateur, le sauvegarde en base et l'envoie par email
    @Transactional
    public void generateAndSendOTP(User utilisateur) {
        // Supprimer les anciens OTP pour éviter les redondances
        otpRepository.deleteByUtilisateur(utilisateur);

        String otpCode = generateOTPCode();
        OTP otp = new OTP();
        otp.setUtilisateur(utilisateur);
        otp.setCode(otpCode);
        otp.setCreatedAt(LocalDateTime.now());
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5)); // validité de 5 minutes
        otp.setAttempts(0);
        otp.setIsUsed(false);
        otpRepository.save(otp);

        sendOTPEmail(utilisateur.getEmail(), otpCode);
    }

    // Génération d'un code à 6 chiffres
    private String generateOTPCode() {
        int otp = new Random().nextInt(900000) + 100000;
        return String.valueOf(otp);
    }

    // Envoi du code OTP par email
    private void sendOTPEmail(String email, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Votre code OTP");
        message.setText("Votre code OTP est : " + otpCode + ". Il expirera dans 5 minutes.");
        mailSender.send(message);
    }

    // Vérifie que le code OTP est correct et non expiré
    public boolean verifyOTP(User utilisateur, String code) {
        Optional<OTP> otpOptional = otpRepository.findByUtilisateurAndCodeAndIsUsed(utilisateur, code, false);
        if (otpOptional.isPresent()) {
            OTP otp = otpOptional.get();
            if (otp.getExpiresAt().isAfter(LocalDateTime.now())) {
                otp.setIsUsed(true); // marque comme utilisé
                otpRepository.save(otp);
                return true;
            }
        }
        return false;
    }
}

