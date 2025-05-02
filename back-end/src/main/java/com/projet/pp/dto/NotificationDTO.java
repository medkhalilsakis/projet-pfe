package com.projet.pp.dto;

import com.projet.pp.model.Notification;
import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDTO {
    private Long id;
    private String type;
    private String payload;
    private boolean read;
    private LocalDateTime createdAt;

    public static NotificationDTO fromEntity(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .type(n.getType())
                .payload(n.getPayload())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}