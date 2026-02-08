package com.derek.backend.service;

import com.derek.backend.dto.*;
import com.derek.backend.exception.*;
import com.derek.backend.message.GameStateMessage;
import com.derek.backend.message.PlayerGameView;
import com.derek.backend.message.PlayerRoomMessage;
import com.derek.backend.model.Player;
import com.derek.backend.model.Room;
import com.derek.backend.status.GameMode;
import com.derek.backend.status.GameState;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.io.*;
import java.time.LocalDateTime;
import java.util.*;

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

        if (request.getGameMode() == GameMode.TWO_IMPOSTER && request.getMaxPlayers() < 5) {
            throw new InvalidCreateRoomException("Two Imposters must have 6 or more players");
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
        host.setWordSpoken(false);
        host.setVoteSent(false);
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
        String roomCode = request.getRoomCode();
        Room room = rooms.get(roomCode);

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
        player.setWordSpoken(false);
        player.setVoteSent(false);

        room.getPlayers().put(player.getId(), player);

        messageTemplate.convertAndSend(
                "/topic/room/" + roomCode,
                GameStateMessage.builder()
                        .type("LOBBY")
                        .gameState(room.getGameState())
                        .room(room)
                        .build()
        );

        return PlayerRoomMessage.builder()
                .roomCode(roomCode)
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
        String roomCode = request.getRoomCode();
        Room room = rooms.get(roomCode);

        if (room == null) {
            throw new RoomNotFoundException("Room not found");
        }

        if (!room.getHost().getId().equals(request.getHostId())) {
            sendError(room.getCode(), "Only host can start the game");
            return;
        }

        if (room.getPlayers().size() < 3) {
            sendError(room.getCode(), "Not enough players to start the game");
            return;
        }

        if (room.getPlayers().size() < 5 && room.getGameMode() == GameMode.TWO_IMPOSTER) {
            sendError(room.getCode(), "Not enough players for two imposters");
            return;
        }

        room.getImposterIds().clear();
        setupGame(room, new Random());

        for (Player player : room.getPlayers().values()) {
            boolean isImposter = room.getImposterIds().contains(player.getId());
            messageTemplate.convertAndSend(
                    "/topic/room/" + roomCode + "/private",
                    (Object) Map.of(
                            "playerId", player.getId(),
                            "isImposter", isImposter,
                            "word", isImposter ? room.getRandomCategory() : room.getRandomWord()
                    )
            );
        }

        messageTemplate.convertAndSend(
                "/topic/room/" + roomCode,
                GameStateMessage.builder()
                        .type("DISCUSSION")
                        .gameState(room.getGameState())
                        .room(room)
                        .build()
        );
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
            messageTemplate.convertAndSend(
                    "/topic/room/" + room.getCode(),
                    (Object) Map.of("type", "HOST_LEFT")
            );

        } else {
            // Remove player
            room.getPlayers().remove(playerId);
            messageTemplate.convertAndSend(
                    "/topic/room/" + room.getCode(),
                    GameStateMessage.builder()
                            .type("LOBBY")
                            .gameState(room.getGameState())
                            .room(room)
                            .build()
            );
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
                "/topic/room/" + room.getCode(),
                GameStateMessage.builder()
                        .type("LOBBY")
                        .gameState(room.getGameState())
                        .room(room)
                        .kickedPlayerId(playerId)
                        .build()
        );
    }

    private void setupGame(Room room, Random random) {
        GameMode gameMode = room.getGameMode();
        List<String> selectedCategories = room.getCategories();
        Map<String, Player> players = room.getPlayers();
        Set<String> imposterIds = room.getImposterIds();

        if (selectedCategories == null || selectedCategories.isEmpty()) {
            throw new CategoriesEmptyException("No categories selected");
        }

        List<String> playerIds = new ArrayList<>(players.keySet());

        switch (gameMode) {
            case ONE_IMPOSTER -> {
                String imposter = playerIds.get(random.nextInt(playerIds.size()));
                imposterIds.add(imposter);
            }

            case TWO_IMPOSTER -> {
                if (playerIds.size() < 5) {
                    throw new InvalidPlayerAmountException("Not enough players for two imposters");
                }

                String firstImposter = playerIds.get(random.nextInt(playerIds.size()));
                String secondImposter;
                do {
                    secondImposter = playerIds.get(random.nextInt(playerIds.size()));
                } while (secondImposter.equals(firstImposter));

                imposterIds.add(firstImposter);
                imposterIds.add(secondImposter);
            }

            default -> throw new InvalidGameModeException("Unsupported game mode");
        }

        String randomCategory = selectedCategories.get(
                random.nextInt(selectedCategories.size())
        );

        InputStream inputStream = getClass()
                .getClassLoader()
                .getResourceAsStream("words/" + randomCategory + ".txt");

        if (inputStream == null) {
            throw new WordFileNotFoundException("Category file not found: " + randomCategory + ".txt");
        }

        List<String> words;
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream))) {
            words = reader.lines().toList();
        } catch (IOException e) {
            throw new RuntimeException(e.getMessage());
        }

        if (words.isEmpty()) {
            throw new EmptyWordFileException("No words found in " + randomCategory + ".txt");
        }

        String randomWord = words.get(random.nextInt(words.size()));

        room.setRandomCategory(randomCategory);
        room.setRandomWord(randomWord);
        room.setGameState(GameState.DISCUSSION);
    }

    private void sendError(String roomCode, String message) {
        messageTemplate.convertAndSend(
                "/topic/room/" + roomCode + "/errors",
                new ErrorMessage(message, HttpStatus.BAD_REQUEST.value(), LocalDateTime.now())
        );
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
