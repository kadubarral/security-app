import React from "react";
import "./SuccessMessage.scss";

function SuccessMessage({ message, clear }) {
  return (
    <div className="success-message">
      <p>{message}</p>
      <button onClick={clear}>Clear</button>
    </div>
  );
}

export default SuccessMessage;
