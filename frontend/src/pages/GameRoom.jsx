import '../css/GameRoom.css';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useEffect, useState } from 'react';
import ErrorToast from '../components/ErrorToast';
import Loading from '../components/Loading';
import Lobby from '../components/Lobby';
import Discussion from '../components/Discussion';

export default function GameRoom() {
    const roomCode = sessionStorage.getItem("roomCode");
    const playerId = sessionStorage.getItem("playerId");
    const isHost = sessionStorage.getItem("host") === "true";

    const [stompClient, setStompClient] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [gameState, setGameState] = useState(null);
    const [localPlayerData, setLocalPlayerData] = useState(null);
    const [error, setError] = useState("")

    async function fetchGameData() {
        try {
            const res = await fetch(`http://localhost:8080/api/v1/games/room/${roomCode}`);
            const data = await res.json();

            if (res.ok) {
                setGameData(data.room);
                setGameState(data.gameState);
            } else {
                setError(data.message || "Failed to get room data");
            }
        } catch (err) {
            setError(err.message || "Network error");
        }
    }

    function cleanupAndRedirect() {
        sessionStorage.removeItem("roomCode");
        sessionStorage.removeItem("playerId");
        sessionStorage.removeItem("host");

        window.location.href = "/";
    }

    function tabClosedEvent() {
        // TODO - Implement tab closed accident
        // If role given during ROLE_REVEAL phase, DISCUSSION Phase, or VOTING Phase (IMPOSTER, INNOCENT) then 
        // the player left by accident game should end for all and show the the results page
    }

    function leaveGame() {
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
        if (!stompClient) return;

        stompClient.publish({
            destination: "/app/room.Start",
            body: JSON.stringify({
                roomCode: roomCode,
                hostId: playerId
            })
        });
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

    function renderGameState() {
        if (!gameData || !gameState) return null;

        switch (gameState) {
            case "LOBBY":
                return <Lobby room={gameData} isHost={isHost} onLeave={leaveGame} onStart={startGame} onKick={kickPlayer} />;

            case "DISCUSSION":
                return <Discussion room={gameData} localPlayer={localPlayerData} />;

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
            // Public room updates
            client.subscribe(`/topic/room/${roomCode}`, (message) => {
                const data = JSON.parse(message.body);
                
                if (data.type === "HOST_LEFT") {
                    cleanupAndRedirect();
                    return;
                }

                if (data.kickedPlayerId === playerId) {
                    cleanupAndRedirect();
                    return;
                }

                if (data.room) {
                    setGameData(data.room);
                    setGameState(data.gameState);
                }
            });

            // Private per-player game info
            client.subscribe(`/topic/room/${roomCode}/private`, (message) => {
                const data = JSON.parse(message.body);
                console.log(data);
                // only set localPlayerData if it’s you
                if (data.playerId === playerId) { 
                    setLocalPlayerData(data);
                }
            });

            // Error handling
            client.subscribe(`/topic/room/${roomCode}/errors`, (message) => {
                const error = JSON.parse(message.body);
                setError(error.message);
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