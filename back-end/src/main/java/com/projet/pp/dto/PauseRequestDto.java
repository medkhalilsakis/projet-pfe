package com.projet.pp.dto;

import com.projet.pp.model.PauseRequest;
import com.projet.pp.model.PauseStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PauseRequestDto {
    private Long id;
    private Long projectId;
    private Long requesterId;
    private String reason;
    private String status;
    private LocalDateTime requestedAt;

    // NOUVEAUTÉS ↓↓↓
    private Long supervisorId;
    private LocalDateTime handledAt;

    public static PauseRequestDto fromEntity(PauseRequest pr) {
        return PauseRequestDto.builder()
                .id(pr.getId())
                .projectId(pr.getProject().getId())
                .requesterId(pr.getRequesterId())
                .reason(pr.getReason())
                .status(pr.getStatus().name())
                .requestedAt(pr.getRequestedAt())
                .supervisorId(pr.getSupervisorId())
                .handledAt(pr.getHandledAt())
                .build();
    }

    /** Si vous avez besoin de désérialiser un PUT pour updateStatus() */
    public PauseRequest toEntity(PauseRequest pr) {
        pr.setStatus(PauseStatus.valueOf(this.status));
        pr.setSupervisorId(this.supervisorId);
        pr.setHandledAt(this.handledAt);
        return pr;
    }
}
