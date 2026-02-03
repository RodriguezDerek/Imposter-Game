package com.derek.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KickPlayerRequest {
    private String hostId;
    private String playerId;
    private String roomCode;
}
