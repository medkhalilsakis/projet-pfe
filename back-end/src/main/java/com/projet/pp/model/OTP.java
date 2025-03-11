package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "otp")
@Getter
@Setter
public class OTP {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Association à l'utilisateur (clé étrangère)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private User utilisateur;

    // Le code OTP, par exemple un code numérique à 6 chiffres
    @Column(nullable = false, length = 10)
    private String code;

    // Date de création du code
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Date d'expiration du code (par exemple, +5 minutes)
    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    // Nombre de tentatives (optionnel)
    @Column
    private int attempts;

    // Indique si l'OTP a déjà été utilisé
    @Column(name = "is_used", nullable = false)
    private boolean isUsed;

    // Getters & setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUtilisateur() {
        return utilisateur;
    }

    public void setUtilisateur(User utilisateur) {
        this.utilisateur = utilisateur;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public boolean isIsUsed() {
        return isUsed;
    }

    public void setIsUsed(boolean isUsed) {
        this.isUsed = isUsed;
    }
}

