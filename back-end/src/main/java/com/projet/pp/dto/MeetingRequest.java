package com.projet.pp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRequest {
    private String subject;
    private LocalDateTime date;
    private String description;

    // ← NE PAS OUBLIER CETTE LIGNE
    private List<Long> participantsIds;

    // getters / setters

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public LocalDateTime getDate() { return date; }
    public void setDate(LocalDateTime date) { this.date = date; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Long> getParticipantsIds() {
        return participantsIds;
    }
    public void setParticipantsIds(List<Long> participantsIds) {
        this.participantsIds = participantsIds;
    }
}
