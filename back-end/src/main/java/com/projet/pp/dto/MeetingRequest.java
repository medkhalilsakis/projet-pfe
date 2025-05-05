package com.projet.pp.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class MeetingRequest {
    private String subject;
    private LocalDateTime date;
    private List<String> participants;
    private String description;
}