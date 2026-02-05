import "../css/RoleReveal.css";

export default function RoleReveal({ role, word }) {
    const isImposter = role === "IMPOSTER";

    return (
        <div className={`role-outer ${isImposter ? "theme-imposter" : "theme-innocent"}`}>
            <div className="top-timer-container">
                <div className="top-timer-fill"></div>
            </div>

            <div className="role-card">
                <div className="role-header">
                    <span className="label-tiny">YOUR ROLE</span>
                    <h1 className="role-title">{role}</h1>
                </div>

                <div className="word-section">
                    <span className="label-tiny">{isImposter ? "HINT" : "THE SECRET WORD IS"}</span>
                    <div className="word-box">
                        <h2>{word}</h2>
                    </div>
                    <p className="hint-text">{isImposter ? "Blend in. Don't let them find you." : "Memorize the word. Do not show anyone."}</p>
                </div>
                
                <div className="auto-next-label">Starting in a few seconds...</div>
            </div>
        </div>
    );
}