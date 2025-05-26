// src/main/java/com/projet/pp/dto/TestScenarioDto.java
package com.projet.pp.dto;

import com.projet.pp.model.TestScenario;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

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

    // Champs pièces jointes (optionnel)
    private String attachmentName;
    private String attachmentPath;
    private String attachmentType;
    private Long attachmentSize;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TestScenarioStepDto {
        private Long id;
        private String description;
        private String expected;
    }

    /**
     * Transforme une entité TestScenario en DTO
     */
    public static TestScenarioDto fromEntity(TestScenario s) {
        return TestScenarioDto.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .projectId(s.getProject().getId())
                .superviseurId(s.getSuperviseur().getId())
                .steps(
                        s.getSteps().stream()
                                .map(st -> TestScenarioStepDto.builder()
                                        .id(st.getId())
                                        .description(st.getDescription())
                                        .expected(st.getExpected())
                                        .build()
                                )
                                .collect(Collectors.toList())
                )
                .attachmentName(s.getAttachmentName())
                .attachmentPath(s.getAttachmentPath())
                .attachmentType(s.getAttachmentType())
                .attachmentSize(s.getAttachmentSize())
                .build();
    }
}
