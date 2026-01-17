import React, { useEffect, useState } from "react";
import "../css/ErrorToast.css";

export default function ErrorToast({ message, onClose, duration = 4000 }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setVisible(true);

        const timer = setTimeout(() => {
            setVisible(false); 
        }, duration);

        return () => clearTimeout(timer);
    }, [duration]);

    useEffect(() => {
        if (!visible) {
            const timer = setTimeout(() => {
                onClose();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    return (
        <div className={`error-toast ${visible ? "show" : "hide"}`}>
            <span className="error-message">{message}</span>
            <button className="close-button" onClick={onClose}>×</button>
        </div>
    );
}
