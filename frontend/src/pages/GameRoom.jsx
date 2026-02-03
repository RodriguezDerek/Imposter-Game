import '../css/GameRoom.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useState } from 'react';
import ErrorToast from '../components/ErrorToast';
import Loading from '../components/Loading';
import Lobby from '../components/Lobby';

export default function GameRoom() {
    // TEMPORARY FOR TESTING
    const roomCode = sessionStorage.getItem("roomCode");
    const playerId = sessionStorage.getItem("playerId");
    const isHost = sessionStorage.getItem("host");

    // FOR PRDOUCTION, UNCOMMENT THESE LINES
    // const roomCode = localStorage.getItem("roomCode");
    // const playerId = localStorage.getItem("playerId");
    // const isHost = localStorage.getItem("host");

    const [stompClient, setStompClient] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [error, setError] = useState("")

    async function fetchGameData() {
        try {
            const response = await fetch(`http://localhost:8080/api/v1/games/room/${roomCode}`);
            const data = await response.json();

            if (response.ok) {
                setGameState(data.gameState)
                setGameData(data.room)
            } else {
                setError(data.message || "Failed to get room data");
            }

        } catch (error) {
            setError(error.message || "Network error")
        }
    }

    function renderGameState() {
        switch (gameState) {
            case "LOBBY":
                return <Lobby room={gameData} isHost={isHost} onLeave={leaveGame} onStart={startGame} onKick={kickPlayer} />;

            default:
                return <p>Unknown game state</p>;
        }
    }

    function leaveGame() {
        localStorage.removeItem("roomCode");
        localStorage.removeItem("playerId");
        localStorage.removeItem("host");
        
        window.location.href = "/";
        // Tell backend websocket that the player has left (not implemented)
    }

    function startGame() {
        console.log("Starting game...");
    }

    function kickPlayer(playerId) {
        console.log("Kicking player:", playerId);
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
                console.log("STOMP message received:", data);
                setGameData(data);
            });

            setStompClient(client);
        };

        client.activate();

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        }
    }, []);

    return(
        <div className="game-outer">
            {error && <ErrorToast message={error} onClose={() => setError("")} duration={4000} />}
            
            {!gameState || !gameData ? (
                <Loading message="Fetching game data..." />
            ) : (
                renderGameState()
            )}
        </div>
    );
}