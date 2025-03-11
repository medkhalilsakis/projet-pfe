package com.projet.pp.repository;

import com.projet.pp.model.OTP;
import com.projet.pp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

public interface OTPRepository extends JpaRepository<OTP, Long> {
    Optional<OTP> findByUtilisateurAndCodeAndIsUsed(User utilisateur, String code, boolean isUsed);

    @Modifying
    @Transactional
    void deleteByUtilisateur(User utilisateur);

    Optional<OTP> findTopByUtilisateurAndIsUsedOrderByExpiresAtDesc(User utilisateur, boolean b);
}
