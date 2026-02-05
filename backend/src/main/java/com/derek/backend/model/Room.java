package com.derek.backend.model;

import com.derek.backend.status.GameMode;
import com.derek.backend.status.GameState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Room {
    private String code;
    private GameMode gameMode;
    private GameState gameState;
    private int maxPlayers;
    private boolean enableHints;
    private String randomCategory;
    private String randomWord;
    private List<String> categories;
    private Player host;
    private Map<String, Player> players = new HashMap<>();  // Key = playerId, value = Player object
    private Set<String> imposterIds = new HashSet<>();      // Player IDs of imposters
}
