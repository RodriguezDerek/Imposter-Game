import { useState, useEffect } from "react";
import "../css/Discussion.css";
import RoleReveal from "./RoleReveal";

export default function Discussion() {
    const players = [
        { id: 1, name: "Player123", status: "active", avatarColor: "#6366f1" },
        { id: 2, name: "Suspect_Zero", status: "done", avatarColor: "#f59e0b" },
        { id: 3, name: "TechnoKing", status: "done", avatarColor: "#10b981" },
        { id: 4, name: "SilentGhost", status: "waiting", avatarColor: "#ec4899" },
        { id: 5, name: "PixelWizard", status: "waiting", avatarColor: "#8b5cf6" },
        { id: 6, name: "NeonShadow", status: "waiting", avatarColor: "#0ea5e9" },
    ];

    // Local player data
    const myPlayer = {
        role: "IMPOSTER",
        word: "Transportation"
    };

    const activePlayer = players.find(p => p.status === 'active');
    const [showRoleReveal, setShowRoleReveal] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowRoleReveal(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    if (showRoleReveal) {
        return <RoleReveal role={myPlayer.role} word={myPlayer.word} />;
    }

    const leftColumn = players.slice(0, 3);
    const rightColumn = players.slice(3, 6);

    return (
        <div className="lobby-wrapper">
            <div className="arena-container">
                <header className="arena-header">
                    <span className="room-code-label">DISCUSSION ROUND</span>
                    <p className="subtitle">{players.length} Players • Describe your word</p>
                    
                    <div className="role-reminder-top">
                        <div className="reminder-content">
                            <span className="reminder-label">YOUR ROLE:</span>
                            <span className={`role-text ${myPlayer.role.toLowerCase()}`}>{myPlayer.role}</span>
                            <div className="divider"></div>
                            <span className="reminder-label">WORD:</span>
                            <span className="word-text">{myPlayer.word}</span>
                        </div>
                    </div>
                </header>

                <main className="arena-main">
                    <div className="center-focus">
                        <span className="room-code-label">NOW SPEAKING</span>
                        <h2 className="room-code">{activePlayer?.name}</h2>
                        <button className="btn btn-start main-action">I SAID MY CLUE</button>
                    </div>

                    <div className="player-orbit">
                        <div className="orbit-side left">
                            {leftColumn.map(player => (
                                <div key={player.id} className={`player-row ${player.status === 'active' ? 'active-turn' : ''} ${player.status === 'waiting' ? 'empty' : ''}`}>
                                    <div className="player-meta">
                                        <div className="avatar" style={{ background: player.avatarColor }}></div>
                                        <span className="player-name">{player.name}</span>
                                    </div>
                                    {player.status === 'active' && <div className="live-indicator"></div>}
                                    {player.status === 'done' && <span className="done-check">✓</span>}
                                </div>
                            ))}
                        </div>

                        <div className="orbit-side right">
                            {rightColumn.map(player => (
                                <div key={player.id} className={`player-row ${player.status === 'active' ? 'active-turn' : ''} ${player.status === 'waiting' ? 'empty' : ''}`}>
                                    <div className="player-meta">
                                        <div className="avatar" style={{ background: player.avatarColor }}></div>
                                        <span className="player-name">{player.name}</span>
                                    </div>
                                    {player.status === 'active' && <div className="live-indicator"></div>}
                                    {player.status === 'done' && <span className="done-check">✓</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </main>

                <footer className="footer-actions">
                    <button className="btn btn-leave">ANOTHER ROUND</button>
                    <button className="btn btn-start">START VOTING</button>
                </footer>
            </div>
        </div>
    );
}