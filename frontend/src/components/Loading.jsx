import React from "react";
import "../css/Loading.css"; 

export default function Loading({ message = "Loading..." }) {
  return (
    <div className="loading-outer">
      <div className="loading-spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}
