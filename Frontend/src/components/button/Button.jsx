import React from "react";
import "./Button.scss";

const Button = ({ text, icon, color, onClick }) => {
  return (
    <button className={`button-component ${color}`} onClick={onClick}>
      {icon && <span className="icon">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
