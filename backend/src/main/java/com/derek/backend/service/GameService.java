package com.derek.backend.service;

import com.derek.backend.dto.*;
import com.derek.backend.exception.*;
import com.derek.backend.message.GameStateMessage;
import com.derek.backend.message.PlayerRoomMessage;
import com.derek.backend.model.Player;
import com.derek.backend.model.Room;
import com.derek.backend.status.GameState;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import javax.naming.NoPermissionException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GameService {

    private final SimpMessageSendingOperations messageTemplate;
    private final Map<String, Room> rooms = new HashMap<>();

    public PlayerRoomMessage createRoom(CreateRoomRequest request) {
        if (request == null) {
            throw new InvalidCreateRoomException("CreateRoomRequest cannot be null");
        }

        if (request.getHostName() == null || request.getHostName().isBlank()) {
            throw new InvalidCreateRoomException("Host name is required");
        }

        if (request.getMaxPlayers() < 3 || request.getMaxPlayers() > 10) {
            throw new InvalidCreateRoomException("Max players must be between 3 and 10");
        }

        if (request.getGameMode() == null) {
            throw new InvalidCreateRoomException("Game mode is required");
        }

        if (request.getCategories() == null || request.getCategories().isEmpty()) {
            throw new InvalidCreateRoomException("At least one category is required");
        }

        String roomCode;
        do {
            roomCode = generateRoomCode();
        } while (rooms.containsKey(roomCode));

        Room room = new Room();
        room.setCode(roomCode);
        room.setGameState(GameState.LOBBY);
        room.setMaxPlayers(request.getMaxPlayers());
        room.setGameMode(request.getGameMode());
        room.setEnableHints(request.isEnableHints());
        room.setCategories(request.getCategories());

        Player host = new Player();
        host.setId(UUID.randomUUID().toString());
        host.setName(request.getHostName().trim());
        host.setHost(true);
        host.setReady(false);
        room.setHost(host);
        room.getPlayers().put(host.getId(), host);

        rooms.put(room.getCode(), room);

        return PlayerRoomMessage.builder()
                .roomCode(room.getCode())
                .playerId(host.getId())
                .isHost(host.isHost())
                .build();
    }

    public PlayerRoomMessage joinRoom(JoinRoomRequest request) {
        Room room = rooms.get(request.getRoomCode());

        if (room == null) {
            throw new RoomNotFoundException("Room not found");
        }

        if (room.getPlayers().size() >= room.getMaxPlayers()) {
            throw new RoomFullException("Room is full");
        }

        String playerName = validatePlayerName(request.getPlayerName());

        if (room.getPlayers().values().stream().anyMatch(p -> p.getName().equalsIgnoreCase(playerName))) {
            throw new PlayerNameExistsException("Someone in the room already has that name");
        }

        Player player = new Player();
        player.setId(UUID.randomUUID().toString());
        player.setName(playerName);
        player.setHost(false);
        player.setReady(false);

        room.getPlayers().put(player.getId(), player);

        messageTemplate.convertAndSend(
                "/topic/room/" + request.getRoomCode(),
                room
        );

        System.out.println(room.getPlayers());

        return PlayerRoomMessage.builder()
                .roomCode(room.getCode())
                .playerId(player.getId())
                .isHost(player.isHost())
                .build();
    }

    public GameStateMessage getRoom(String code) {
        Room room = rooms.get(code);

        if (room == null) {
            throw new RoomNotFoundException("Room not found");
        }

        return GameStateMessage.builder()
                .type("ROOM_INFO")
                .gameState(room.getGameState())
                .room(room)
                .build();
    }

    public void startGame(StartGameRequest request) {

    }

    public void leaveRoom(LeaveGameRequest request) {
        String roomCode = request.getRoomCode();
        String playerId = request.getPlayerId();

        Room room = rooms.get(roomCode);

        if (room == null) {
            throw new RoomNotFoundException("Room not found");
        }

        if (!room.getPlayers().containsKey(playerId)) {
            throw new PlayerNotFoundException("Player not found");
        }

        if (room.getHost().getId().equals(playerId)) {
            // Host left → delete room
            rooms.remove(roomCode);
            Map<String, String> payload = Map.of("type", "HOST_LEFT");
            messageTemplate.convertAndSend("/topic/room/" + roomCode, payload);

        } else {
            // Remove player
            room.getPlayers().remove(playerId);
            messageTemplate.convertAndSend("/topic/room/" + roomCode, room);
        }
    }

    public void kickPlayer(KickPlayerRequest request) {
        String roomCode = request.getRoomCode();
        String hostId = request.getHostId();
        String playerId = request.getPlayerId();

        Room room = rooms.get(roomCode);

        if (room == null) {
            throw new RoomNotFoundException("Room not found");
        }

        if (hostId.equals(playerId)) {
            throw new InvalidPermissionException("Cannot kick yourself");
        }

        if (!room.getHost().getId().equals(hostId)) {
            throw new InvalidPermissionException("Only host can kick players");
        }

        room.getPlayers().remove(playerId);

        messageTemplate.convertAndSend(
                "/topic/room/" + roomCode,
                room
        );
    }

    public void setRoleReady() {
    }

    private String validatePlayerName(String name) {
        if (name == null || name.isBlank()) {
            throw new InvalidCreateRoomException("Player name is required");
        }

        String cleaned = name.trim();

        if (cleaned.length() < 3 || cleaned.length() > 15) {
            throw new InvalidCreateRoomException("Player name must be between 3 and 15 characters");
        }

        if (!cleaned.matches("^[a-zA-Z0-9_ ]+$")) {
            throw new InvalidCreateRoomException("Player name can only contain letters, numbers, spaces, and underscores");
        }

        return cleaned;
    }

    private String generateRoomCode() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
    }
}
