// src/main/java/com/projet/pp/dto/CallSignal.java
package com.projet.pp.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CallSignal {
    private String type;           // "offer","answer","ice","end"
    private Long fromUserId;
    private Long targetUserId;
    private String sdp;            // pour offer/answer
    private String candidate;      // pour ice
}
