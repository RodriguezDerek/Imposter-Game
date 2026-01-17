package com.derek.backend.dto;

import com.derek.backend.status.GameMode;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CreateRoomRequest {
    private String hostName;
    private int maxPlayers;
    private GameMode gameMode;
    private boolean enableHints;
    private List<String> categories;
}
