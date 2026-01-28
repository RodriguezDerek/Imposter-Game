import '../css/CreateRoom.css';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import ErrorToast from '../components/ErrorToast';

export default function CreateRoom() {
    const categories = [
            "Animals",
            "Food",
            "Technology",
            "Education",
            "Sports",
            "Health",
            "Travel",
            "Music",
            "Movies",
            "Books",
            "Fashion",
            "Science",
            "History",
            "Art",
            "Nature",
            "Gaming",
            "Business",
            "Finance",
            "Photography",
            "Fitness",
            "Lifestyle",
            "Culture",
            "Politics",
            "Environment",
            "Automotive",
            "Parenting",
            "DIY"
        ];

    const [hostName, setHostName] = useState("")
    const [maxPlayers, setMaxPlayers] = useState(null)
    const [gameMode, setGameMode] = useState("")
    const [enableHints, setEnableHints] = useState(true)
    const [selectedCategories, setSelectedCategories] = useState([])
    const [error, setError] = useState("")

    async function handleCreateRoom(e) {
        e.preventDefault(); 

        if (!hostName.trim()) {
            setError("Please enter a host name before creating the room.");
            return;
        }

        if (!maxPlayers) {
            setError("Select the number of players for the game.");
            return;
        }

        if (!gameMode) {
            setError("Choose a game mode to proceed.");
            return;
        }

        if (selectedCategories.length === 0) {
            setError("Select at least one category to play.");
            return;
        }

         const payload = {
            hostName,
            maxPlayers,
            gameMode,
            enableHints,
            categories: selectedCategories
        };
        
        try {
            const response = await fetch("http://localhost:8080/api/v1/games/room/create", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                localStorage.setItem("roomCode", data.roomCode);
                localStorage.setItem("playerId", data.playerId);
                localStorage.setItem("host", data.host);

                //window.location.href = "/room"

            } else {
                setError(data.message || "Failed to create room");
            }

        } catch (error) {
            setError(error.message || "Network error");
        }
    }

    function clearRoomData() {
        localStorage.removeItem("roomCode");
        localStorage.removeItem("playerId");
        localStorage.removeItem("host");
    }

    function handleCategoryToggle(category) {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    }

    return(
        
        <div className="create-outer">
            {error && <ErrorToast message={error} onClose={() => setError("")} duration={4000} />}

            <div className="create-left-panel">
                <h1 className="create-left-panel-title">Create Room</h1>
                <p className="create-left-panel-subtitle">Set up your game</p>

                <form className="create-form" onSubmit={handleCreateRoom}>
                    <label className="create-label">Host Name</label>
                    <input value={hostName} onChange={(e) => setHostName(e.target.value)} className="create-input" placeholder="Enter player name"/>

                    <div className="create-row">
                        <div className="create-field">
                            <label className="create-label">Max Players</label>
                            <select value={maxPlayers || ""} onChange={(e) => setMaxPlayers(Number(e.target.value))} className="create-input select-placeholder">
                                <option value="" disabled hidden>Select players</option>
                                <option value={4}>4 Players</option>
                                <option value={6}>6 Players</option>
                                <option value={8}>8 Players</option>
                                <option value={10}>10 Players</option>
                            </select>
                        </div>

                        <div className="create-field">
                            <label className="create-label">Game Mode</label>
                            <select value={gameMode} onChange={(e) => setGameMode(e.target.value)} className="create-input select-placeholder">
                                <option value="" disabled hidden>Select mode</option>
                                <option value="ONE_IMPOSTER">One Imposter</option>
                                <option value="TWO_IMPOSTER">Two Imposter</option>
                            </select>
                        </div>
                    </div>

                    <div className="create-btn-container">
                        <label className="create-label">Hints</label>
                        <div className="create-btn-group">
                            <button type="button" className={`create-btn-on ${enableHints ? "active" : ""}`} onClick={() => setEnableHints(true)}>ON</button>
                            <button type="button" className={`create-btn-off ${!enableHints ? "active" : ""}`} onClick={() => setEnableHints(false)}>OFF</button>
                        </div>
                    </div>

                    <div className="create-btn-container-submit">
                        <div className="create-btn-group-submit">
                            <Link to="/home" className="create-button-back">Back</Link>
                            <button type="submit" className="create-button-room">Create</button>
                        </div>  
                    </div>

                    <p className="create-footer">A room code will be generated automatically</p>

                </form>
            </div>

            <div className="create-right-panel">
                <h1 className="create-right-panel-title">Categories</h1>

                <div className="create-category-container">
                    {categories.map((category) => {
                        return (
                            <div key={category} className={`category-item ${selectedCategories.includes(category) ? "selected" : ""}`} onClick={() => handleCategoryToggle(category)}>
                                {category}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}