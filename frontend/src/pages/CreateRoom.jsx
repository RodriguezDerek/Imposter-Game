import '../css/CreateRoom.css';
import { useState } from 'react';

export default function CreateRoom() {
    const categories = ["Animals", "Food", "Technology", "Education"]

    const [hostName, setHostName] = useState(null)
    const [maxPlayers, setMaxPlayers] = useState(null)
    const [gameMode, setGameMode] = useState(null)
    const [enableHints, setEnableHints] = useState(true)
    const [selectedCategories, setSelectedCategories] = useState([])

    async function handleCreateRoom() {
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
            <div className="create-left-panel">
                <h1 className="create-left-panel-title">Create Room</h1>
                <p className="create-left-panel-subtitle">Set up your game</p>

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