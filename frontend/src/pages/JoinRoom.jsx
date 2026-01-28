import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/JoinRoom.css'

export default function JoinRoom() {

    const [playerName, setPlayerName] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const [error, setError] = useState("")

    async function handleJoinRoom() {
        console.log("Joining room...");
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