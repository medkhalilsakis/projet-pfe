// src/main/java/com/projet/pp/dto/FinishedProjectDTO.java
package com.projet.pp.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinishedProjectDTO {
    private Long projectId;
    private String name;
    private Integer status;
    private LocalDateTime pausedAt;
    private LocalDateTime closureAt;
    private String supervisorName;
    private List<String> testerNames;
}
