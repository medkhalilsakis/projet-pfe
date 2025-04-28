// src/main/java/com/projet/pp/dto/ProjectStatsDTO.java
package com.projet.pp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProjectStatsDTO {
    private long totalFiles;
    private Map<String, Long> countsByExtension;
}
