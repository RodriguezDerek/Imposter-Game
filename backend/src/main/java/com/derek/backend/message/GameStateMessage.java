package com.derek.backend.message;

import com.derek.backend.model.Room;
import com.derek.backend.status.GameState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GameStateMessage {
    private String type;
    private GameState gameState;
    private String playerId;
    private Room room;
}
