import "../css/Lobby.css"

export default function Lobby({ room, isHost }) {
    
    function clearRoomData() {
        localStorage.removeItem("roomCode");
        localStorage.removeItem("playerId");
        localStorage.removeItem("host");
    }

    return(
        <div className="lobby-con">
            <h1>Lobby Component</h1>
            <h1>{isHost}</h1>
            <h1>{room.code}</h1>
            <h1>{room.gameMode}</h1>
            <h1>{room.gameState}</h1>
            <h1>{room.maxPlayers}</h1>
            <h1>{room.enableHints}</h1>
            {Object.entries(room.players).map(([playerId, player]) => (
                <div key={playerId}>
                    <strong>{player.name}</strong>
                </div>
            ))}        
        </div>
    );
}
