package com.projet.pp.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ProjectInvitedUserId implements Serializable {
    @Column(name = "project_id")
    private Long projectId;

    @Column(name = "user_id")
    private Long userId;
}