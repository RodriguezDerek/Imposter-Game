import '../css/GameRoom.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useState } from 'react';
import ErrorToast from '../components/ErrorToast';
import Loading from '../components/Loading';
import Lobby from '../components/Lobby';

export default function GameRoom() {
    const roomCode = localStorage.getItem("roomCode");
    const isHost = localStorage.getItem("host");

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
                return <Lobby room={gameData} isHost={isHost}/>;

            default:
                return <p>Unknown game state</p>;
        }
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
        };

        client.activate();

        return () => client.deactivate();
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