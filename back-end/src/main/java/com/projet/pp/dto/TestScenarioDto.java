// src/main/java/com/projet/pp/dto/TestScenarioDto.java
package com.projet.pp.dto;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestScenarioDto {
    private Long id;
    private String name;
    private String description;
    private Long projectId;
    private Long superviseurId;
    private List<TestScenarioStepDto> steps;


    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TestScenarioStepDto {
        private Long id;
        private String description;
        private String expected;
    }
}

