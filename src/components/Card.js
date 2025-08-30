import React from "react";
import "../App.css";

const Card = ({ card, onCardClick }) => {
  return (
    <div
      className={`card ${card.flipped || card.matched ? "flipped" : ""}`}
      onClick={() => onCardClick(card)}
    >
      <div className="card-inner">
        <div className="card-front">{card.symbol}</div>
        <div className="card-back">❓</div>
      </div>
    </div>
  );
};

export default Card;
