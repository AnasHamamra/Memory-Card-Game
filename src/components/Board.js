import React from "react";
import Card from "./Card";
import "../App.css";

const Board = ({ cards, onCardClick, pairsCount }) => {
  const columns =
    pairsCount <= 6 ? 4 : pairsCount <= 8 ? 4 : 6; // الأعمدة حسب المستوى

  return (
    <div
      className="board"
      style={{
        gridTemplateColumns: `repeat(${columns}, 100px)`,
      }}
    >
      {cards.map((card) => (
        <Card key={card.id} card={card} onCardClick={onCardClick} />
      ))}
    </div>
  );
};

export default Board;
