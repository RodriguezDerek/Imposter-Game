package com.derek.backend.controller;

import com.derek.backend.dto.StartGameRequest;
import com.derek.backend.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class GameSocketController {

    private final GameService gameService;

    @MessageMapping("room.Start")
    public void startGame(StartGameRequest request) {
        gameService.startGame(request);
    }
}
