package com.projet.pp.service;

import com.projet.pp.model.OTP;
import com.projet.pp.model.User;
import com.projet.pp.repository.OTPRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OTPService {

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private JavaMailSender mailSender;


    @Transactional
    public void generateAndSendOTP(User utilisateur) {
        otpRepository.deleteByUtilisateur(utilisateur);

        String otpCode = generateOTPCode();
        OTP otp = new OTP();
        otp.setUtilisateur(utilisateur);
        otp.setCode(otpCode);
        otp.setCreatedAt(LocalDateTime.now());
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(5));
        otp.setAttempts(0);
        otp.setIsUsed(false);
        otpRepository.save(otp);

        sendOTPEmail(utilisateur.getEmail(), otpCode);
    }

    private String generateOTPCode() {
        int otp = new Random().nextInt(900000) + 100000;
        return String.valueOf(otp);
    }

    private void sendOTPEmail(String email, String otpCode) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Votre code OTP");
        message.setText("Votre code OTP est : " + otpCode + ". Il expirera dans 5 minutes.");
        mailSender.send(message);
    }

    public boolean verifyOTP(User utilisateur, String code) {
        Optional<OTP> otpOptional = otpRepository.findTopByUtilisateurAndIsUsedOrderByExpiresAtDesc(
                utilisateur,
                false
        );

        return otpOptional
                .filter(otp -> otp.getCode().equals(code))
                .filter(otp -> otp.getExpiresAt().isAfter(LocalDateTime.now()))
                .map(otp -> {
                    otp.setIsUsed(true);
                    otpRepository.save(otp);
                    return true;
                })
                .orElse(false);
    }



    public boolean validateOTP(User utilisateur, String code) {
        return otpRepository
                .findTopByUtilisateurAndIsUsedOrderByExpiresAtDesc(utilisateur, false)
                .filter(otp -> otp.getCode().equals(code))
                .filter(otp -> otp.getExpiresAt().isAfter(LocalDateTime.now()))
                .isPresent();
    }

}
