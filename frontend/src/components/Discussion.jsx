import { useState, useEffect, use } from "react";
import "../css/Discussion.css";
import RoleReveal from "./RoleReveal";

export default function Discussion() {
    const [showRoleReveal, setShowRoleReveal] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowRoleReveal(false);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    if (showRoleReveal) {
        return <RoleReveal role="IMPOSTER" word="Transportation" />;
    }
    
    return (
        <div>
            <h2>Discussion Phase - To be implemented</h2>
        </div>
    );
}