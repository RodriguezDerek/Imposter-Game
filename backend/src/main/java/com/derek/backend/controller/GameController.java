package com.derek.backend.controller;

import com.derek.backend.dto.CreateRoomRequest;
import com.derek.backend.dto.JoinRoomRequest;
import com.derek.backend.message.GameStateMessage;
import com.derek.backend.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/v1/games")
public class GameController {

    private final GameService gameService;

    @PostMapping("/room/create")
    public ResponseEntity<GameStateMessage> createRoom(@RequestBody CreateRoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gameService.createRoom(request));
    }

    @PostMapping("/room/join")
    public ResponseEntity<GameStateMessage> joinRoom(@RequestBody JoinRoomRequest request) {
        return ResponseEntity.status(HttpStatus.OK).body(gameService.joinRoom(request));
    }
}
