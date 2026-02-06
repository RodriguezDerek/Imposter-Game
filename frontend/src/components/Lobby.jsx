import "../css/Lobby.css";

export default function Lobby({ room, isHost, onLeave, onStart, onKick }) {
    const hostPlayer = room.players[room.host.id];
    const otherPlayers = Object.entries(room.players).filter(([id]) => id !== room.host.id);

    return (
        <div className="lobby-wrapper">
            <div className="lobby-card">
                
                <main className="lobby-main">
                    <span className="room-code-label">SHARE THIS CODE</span>
                    <h1 className="room-code">{room.code}</h1>
                    <div className="settings-grid">
                        <div className="setting-item">
                            <span>Max Players</span>
                            <strong>{room.maxPlayers} Players</strong>
                        </div>
                        <div className="setting-item">
                            <span>Imposters</span>
                            <strong>{room.gameMode === "ONE_IMPOSTER" ? 1 : 2} Count</strong>
                        </div>
                        <div className="setting-item">
                            <span>Hints</span>
                            <strong className="status-on" style={{color : room.enableHints ? "green" : "red"}}>{room.enableHints ? "Enabled" : "Disabled"}</strong>
                        </div>
                    </div>

                    <div className="player-list">
                        <h3>Players in Lobby ({Object.keys(room.players).length}/{room.maxPlayers})</h3>

                        <div className="player-rows-container">
                            <div className="player-row host-row">
                                <div className="player-meta">
                                    <div className="avatar" style={{ background: hostPlayer.color || 'linear-gradient(135deg, #6366f1, #a855f7)' }}/>
                                    <span className="player-name">{hostPlayer.name} (Host)</span>
                                </div>
                            </div>

                            {otherPlayers.map(([playerId, player]) => (
                                <div key={playerId} className="player-row">
                                    <div className="player-meta">
                                        <div className="avatar" style={{ background: player.color || 'linear-gradient(135deg, #6366f1, #a855f7)' }}/>
                                        <span className="player-name">{player.name}</span>
                                    </div>
                                    {isHost && playerId !== room.host.id && (
                                        <button className="remove-btn" title="Kick Player" onClick={() => onKick(playerId)}>✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="footer-actions">
                        <button className="btn btn-leave" onClick={onLeave}>Leave Game</button>
                        {isHost && <button className="btn btn-start" onClick={onStart}>Start Game</button>}
                    </div>
                </main>

                <aside className="lobby-sidebar">
                    <h2 className="sidebar-title">Game Categories</h2>
                    <div className="category-grid">
                        {room.categories.map((cat, idx) => (
                            <div key={idx} className={`category-item ${cat ? 'active' : 'empty'}`}>{cat || 'Empty Slot'}</div>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
}