// src/main/java/com/projet/pp/dto/MeetingDto.java
package com.projet.pp.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingDto {
    private Long id;
    private String subject;
    private LocalDateTime date;
    private List<Long> participantsIds;
    private List<String> attachments;
    private String description;
    private Long projectId;
}
