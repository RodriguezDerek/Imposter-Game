import { useState, useEffect } from "react";
import RoleReveal from "./RoleReveal.jsx"
import "../css/Discussion.css";

export default function Discussion({ room, localPlayerInfo }) {
    const playersArray = Object.values(room.players || {});
    const [showRoleReveal, setShowRoleReveal] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setShowRoleReveal(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (showRoleReveal) {
        return (
            <RoleReveal roleInfo={localPlayerInfo}/>
        );
    }

    return (
        <div className="lobby-wrapper">
        </div>
   );
}