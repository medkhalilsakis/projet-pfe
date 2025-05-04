package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "project_clotures")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectClosure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Le projet clôturé */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    /** Le superviseur qui demande la clôture */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supervisor_id", nullable = false)
    private User supervisor;

    /** Raison textuelle de la clôture */
    @Column(columnDefinition = "TEXT", nullable = false)
    private String reason;

    /** Date de la demande de clôture */
    @Column(name = "closure_at", nullable = false)   // renommé de “closured_at” à “closure_at”
    private LocalDateTime closureAt = LocalDateTime.now();

    /** Pièces jointes éventuelles */
    @OneToMany(mappedBy = "closure",
            cascade = CascadeType.ALL,
            orphanRemoval = true)
    private List<CloseAttachment> attachments = new ArrayList<>();



    public LocalDateTime getClosedAt(){
        return closureAt;
    }
}
