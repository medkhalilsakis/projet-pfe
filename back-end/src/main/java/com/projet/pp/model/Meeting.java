package com.projet.pp.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Meeting {
    @Id @GeneratedValue private Long id;
    private String subject;
    private LocalDateTime date;
    @ElementCollection private List<String> participants;
    @ElementCollection private List<String> attachments;
    @Column(columnDefinition="TEXT") private String description;
    @ManyToOne @JoinColumn(name="project_id") private Project project;
}