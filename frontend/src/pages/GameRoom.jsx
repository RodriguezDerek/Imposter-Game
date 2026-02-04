import '../css/GameRoom.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { use, useEffect, useState } from 'react';
import ErrorToast from '../components/ErrorToast';
import Loading from '../components/Loading';
import Lobby from '../components/Lobby';

export default function GameRoom() {
    // TEMPORARY FOR TESTING
    const roomCode = sessionStorage.getItem("roomCode");
    const playerId = sessionStorage.getItem("playerId");
    const isHost = sessionStorage.getItem("host") === "true";

    // FOR PRDOUCTION, UNCOMMENT THESE LINES
    // const roomCode = localStorage.getItem("roomCode");
    // const playerId = localStorage.getItem("playerId");
    // const isHost = localStorage.getItem("host") === "true";

    const [stompClient, setStompClient] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [error, setError] = useState("")

    async function fetchGameData() {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/games/room/${roomCode}`);
            const data = await response.json();

            if (response.ok) {
                setGameState(data.gameState);
                setGameData(data.room);
            } else {
                setError(data.message || "Failed to get room data");
            }
        } catch (err) {
            setError(err.message || "Network error");
        }
    }

    function renderGameState() {
        if (!gameData) return null;

        switch (gameState) {
            case "LOBBY":
                return <Lobby room={gameData} isHost={isHost} onLeave={leaveGame} onStart={startGame} onKick={kickPlayer} />;

            default:
                return <p>Unknown game state</p>;
        }
    }

    function cleanupAndRedirect() {
        sessionStorage.removeItem("roomCode");
        sessionStorage.removeItem("playerId");
        sessionStorage.removeItem("host");

        window.location.href = "/";
    }

    function leaveGame() {
        // TODO - Implement tab closed then leave room

        if (!stompClient) return;
        
        stompClient.publish({
            destination: "/app/room.Leave",
            body: JSON.stringify({
                playerId: playerId,
                roomCode: roomCode
            })
        })

        cleanupAndRedirect();
    }

    function startGame() {
        console.log("Starting game...");
        // TODO: Implement start game logic
    }

    function kickPlayer(playerToKickId) {
        if (!stompClient) return;

        stompClient.publish({
            destination: "/app/room.Kick",
            body: JSON.stringify({
                roomCode: roomCode,
                hostId: playerId,
                playerId: playerToKickId
            })
        });
    }

    useEffect(() => {
        fetchGameData();

        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            reconnectDelay: 5000
        });

        client.onConnect = () => {
            client.subscribe(`/topic/room/${roomCode}`, (message) => {
                const data = JSON.parse(message.body);
                
                if (data.type === "HOST_LEFT") {
                    cleanupAndRedirect();
                    return;
                }

                setGameData(data);

                // If player was kicked
                if (!data.players?.[playerId]) {
                    cleanupAndRedirect();
                }
            });

            setStompClient(client);
        };

        client.activate();

        return () => {
            client.deactivate();
        }
    }, []);

    return(
        <div className="game-outer">
            {error && <ErrorToast message={error} onClose={() => setError("")} duration={4000} />}
            
            {!gameState || !gameData ? (
                <Loading message="Loading Lobby..." />
            ) : (
                renderGameState()
            )}
        </div>
    );
}