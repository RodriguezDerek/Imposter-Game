import "../css/Lobby.css";

export default function Lobby({ room, isHost, onLeave, onStart, onKick }) {
    return (
        <div className="lobby-wrapper">
            <div className="lobby-card">
                
                <main className="lobby-main">
                    <span className="room-code-label">SHARE THIS CODE</span>
                    <h1 className="room-code">{room.code}</h1>
                    <h1>{console.log(isHost)}</h1>
                    <div className="settings-grid">
                        <div className="setting-item">
                            <span>Max Players</span>
                            <strong>{room.settings?.maxPlayers || 4} Players</strong>
                        </div>
                        <div className="setting-item">
                            <span>Imposters</span>
                            <strong>{room.settings?.imposters || 2} Count</strong>
                        </div>
                        <div className="setting-item">
                            <span>Hints</span>
                            <strong className="status-on" style={{color : room.enableHints ? "green" : "red"}}>{room.enableHints ? "Enabled" : "Disabled"}</strong>
                        </div>
                    </div>

                    <div className="player-list">
                        <h3>Players in Lobby ({Object.keys(room.players).length}/4)</h3>
                        
                        {Object.entries(room.players).map(([playerId, player]) => (
                            <div key={playerId} className="player-row">
                                <div className="player-meta">
                                    <div className="avatar" style={{ background: player.color || 'linear-gradient(135deg, #6366f1, #a855f7)' }} />
                                    <span className="player-name">{player.name}</span>
                                </div>
                                {isHost === "true" && <button className="remove-btn" title="Kick Player" onClick={() => onKick(playerId)}>✕</button>}
                            </div>
                        ))}
                    </div>

                    <div className="footer-actions">
                        <button className="btn btn-leave" onClick={onLeave}>Leave Game</button>
                        {isHost === "true" && <button className="btn btn-start" onClick={onStart}>Start Game</button>}
                    </div>
                </main>

                <aside className="lobby-sidebar">
                    <h2 className="sidebar-title">Game Categories</h2>
                    <div className="category-grid">
                        {room.categories.map((cat, idx) => (
                            <div key={idx} className={`category-item ${cat ? 'active' : 'empty'}`}>
                                {cat || 'Empty Slot'}
                            </div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}