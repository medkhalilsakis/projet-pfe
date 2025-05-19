package com.projet.pp.controller;

import com.projet.pp.model.Meeting;
import com.projet.pp.service.MeetingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{uid}/meetings")

public class UserMeetingController {

    @Autowired
    private MeetingService meetingService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Meeting>> listByUser(@PathVariable("uid") Long userId) {
        List<Meeting> meetings = meetingService.findByUser(userId);
        return ResponseEntity.ok(meetings);
    }
}