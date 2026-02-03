import '../css/JoinRoom.css'
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ErrorToast from '../components/ErrorToast';

export default function JoinRoom() {
    const navigate = useNavigate();

    const [playerName, setPlayerName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("")

    async function handleJoinRoom(e) {
        e.preventDefault()

        if (!playerName.trim()) {
            setError("Please enter a player name");
            return;
        }

        if (!roomCode.trim()) {
            setError("Please enter a room code")
            return;
        }

        const payload = {
            playerName,
            roomCode
        }

        try {
            const response = await fetch("http://localhost:8080/api/v1/games/room/join", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json();

            if (response.ok) {
                // FOR PRDOUCTION, UNCOMMENT THESE LINES
                // localStorage.setItem("roomCode", data.roomCode);
                // localStorage.setItem("playerId", data.playerId);
                // localStorage.setItem("host", data.host);

                // TEMPORARY FOR TESTING
                sessionStorage.setItem("roomCode", data.roomCode);
                sessionStorage.setItem("playerId", data.playerId);
                sessionStorage.setItem("host", data.host);

                navigate(`/room/${data.roomCode}`);

            } else {
                setError(data.message || "Failed to join room")
            }

        } catch (error) {
            setError(error.message || "Network error")
        }
    }

    return(
        <div className="join-outer">
            {error && <ErrorToast message={error} onClose={() => setError("")} duration={4000} />}

            <div className="join-inner">
                <h1 className="join-title">Join Room</h1>
                <p className="join-subtitle">Enter a room code to play</p>

                <form className="join-form" onSubmit={handleJoinRoom}>
                    <div className="join-subcontainer">
                        <label className="join-label">Player Name</label>
                        <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="join-input" placeholder="Enter player name"/>

                        <label className="join-label">Room Code</label>
                        <input value={roomCode} onChange={(e) => setRoomCode(e.target.value)} className="join-input" placeholder="Enter room code"/>
                    </div>

                    <div className="join-btn-container-submit">
                        <Link to="/home" className="join-button-back">Back</Link>
                        <button type="submit" className="join-button-room">Join Room</button>
                    </div>

                    <p className="join-footer">Room codes are case-insensitive</p>
                </form>
            </div>
        </div>
    );
}