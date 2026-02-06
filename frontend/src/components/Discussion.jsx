import { useState, useEffect } from "react";
import "../css/Discussion.css";
import RoleReveal from "./RoleReveal";

export default function Discussion({ room, localPlayer }) {
    const [showRoleReveal, setShowRoleReveal] = useState(true); 

    useEffect(() => {
        const timer = setTimeout(() => setShowRoleReveal(false), 5000);
        return () => clearTimeout(timer);
    }, []);

    if (showRoleReveal) {
        return <RoleReveal roleInfo={localPlayer} />;
    }

    return (
        <div>
            <h1>{console.log(room)}</h1>
            <h2>{console.log(localPlayer)}</h2>
        </div>
    );
}