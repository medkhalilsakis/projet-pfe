package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "closure_attachments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CloseAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** À quelle clôture cette pièce jointe est liée */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closure_id", nullable = false)
    private ProjectClosure closure;

    /** Nom original du fichier */
    @Column(nullable = false)
    private String filename;

    /** Chemin sur le disque ou URL */
    @Column(nullable = false)
    private String path;
}
