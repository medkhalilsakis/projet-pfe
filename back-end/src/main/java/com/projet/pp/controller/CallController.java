// src/main/java/com/projet/pp/controller/CallController.java
package com.projet.pp.controller;

import com.projet.pp.dto.CallSignal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class CallController {

    @Autowired
    private SimpMessagingTemplate template;

    /**
     * Offer SDP envoyé par l’appelant
     */
    @MessageMapping("/call.offer")
    public void offer(CallSignal signal) {
        template.convertAndSend(
                "/topic/call/" + signal.getTargetUserId(),
                signal
        );
    }
    @MessageMapping("/call.answer")
    public void answer(CallSignal signal) {
        template.convertAndSend(
                "/topic/call/" + signal.getTargetUserId(),
                signal
        );
    }

    @MessageMapping("/call.ice")
    public void ice(CallSignal signal) {
        template.convertAndSend(
                "/topic/call/" + signal.getTargetUserId(),
                signal
        );
    }

    /**
     * Notification de fin d’appel / appel manqué
     */
    @MessageMapping("/call.end")
    public void end(CallSignal signal) {
        template.convertAndSend(
                "/topic/call/" + signal.getTargetUserId(),
                signal
        );
    }
}
