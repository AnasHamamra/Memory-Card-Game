import React, { useEffect, useState } from "react";
import Board from "./components/Board";
import "./App.css";

// الرموز الأساسية
const baseSymbols = ["🍎", "🍌", "🍇", "🍓", "🐶", "🐱", "🚗", "✈️", "⚽", "🎸", "🎮", "📷"];

const App = () => {
  const [cards, setCards] = useState([]);
  const [firstCard, setFirstCard] = useState(null);
  const [secondCard, setSecondCard] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [moves, setMoves] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [bestScore, setBestScore] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");

  // تحديد عدد الأزواج حسب المستوى
  const getPairsCount = () => {
    switch (difficulty) {
      case "easy":
        return 6;
      case "hard":
        return 12;
      default:
        return 8;
    }
  };

  // دالة لخلط الكروت
  const shuffleCards = () => {
    const pairsCount = getPairsCount();
    const selectedSymbols = baseSymbols.slice(0, pairsCount);

    const shuffled = [...selectedSymbols, ...selectedSymbols]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({
        id: index,
        symbol,
        flipped: false,
        matched: false,
      }));

    setCards(shuffled);
    setFirstCard(null);
    setSecondCard(null);
    setMoves(0);
    setGameOver(false);
    setTime(0);
    setTimerActive(true);
  };

  // عند بداية التشغيل أو تغيير المستوى نخلط الكروت
  useEffect(() => {
    shuffleCards();
  }, [difficulty]);

  // تشغيل المؤقت
  useEffect(() => {
    let interval;
    if (timerActive && !gameOver) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive, gameOver]);

  // اختيار الكروت
  const handleCardClick = (card) => {
    if (disabled || card.flipped || card.matched) return;

    if (!firstCard) {
      setFirstCard(card);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
      );
    } else if (!secondCard) {
      setSecondCard(card);
      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, flipped: true } : c))
      );
      setDisabled(true);
    }
  };

  // تحقق من التطابق
  useEffect(() => {
    if (firstCard && secondCard) {
      if (firstCard.symbol === secondCard.symbol) {
        setCards((prev) =>
          prev.map((c) =>
            c.symbol === firstCard.symbol ? { ...c, matched: true } : c
          )
        );
        resetTurn();
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === firstCard.id || c.id === secondCard.id
                ? { ...c, flipped: false }
                : c
            )
          );
          resetTurn();
        }, 1000);
      }
      setMoves((prev) => prev + 1);
    }
  }, [firstCard, secondCard]);

  // تحقق من نهاية اللعبة
  useEffect(() => {
    if (cards.length && cards.every((card) => card.matched)) {
      setGameOver(true);
      setTimerActive(false);

      // تحديث أفضل نتيجة
      const prevBest = JSON.parse(localStorage.getItem("bestScore")) || {};
      const levelBest = prevBest[difficulty];

      if (
        !levelBest ||
        moves < levelBest.moves ||
        (moves === levelBest.moves && time < levelBest.time)
      ) {
        const newBest = {
          ...prevBest,
          [difficulty]: { moves, time },
        };
        localStorage.setItem("bestScore", JSON.stringify(newBest));
        setBestScore(newBest[difficulty]);
      } else if (levelBest) {
        setBestScore(levelBest);
      }
    }
  }, [cards, moves, time]);

  // تحميل أفضل نتيجة من localStorage
  useEffect(() => {
    const prevBest = JSON.parse(localStorage.getItem("bestScore")) || {};
    setBestScore(prevBest[difficulty] || null);
  }, [difficulty]);

  // إعادة تعيين الجولة
  const resetTurn = () => {
    setFirstCard(null);
    setSecondCard(null);
    setDisabled(false);
  };

  // تنسيق الوقت
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="app">
      <h1>🧠 Memory Card Game</h1>

      {/* اختيار مستوى الصعوبة */}
      <div className="difficulty">
        <label>Difficulty: </label>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        >
          <option value="easy">Easy (6 pairs)</option>
          <option value="medium">Medium (8 pairs)</option>
          <option value="hard">Hard (12 pairs)</option>
        </select>
      </div>

      {/* أزرار التحكم */}
      <div className="controls">
        <button className="restart-btn" onClick={shuffleCards}>
          🔄 Restart
        </button>
        <p>Moves: {moves}</p>
        <p>Time: {formatTime(time)}</p>
        {bestScore && (
          <p className="best-score">
            🏆 Best: {bestScore.moves} moves in {formatTime(bestScore.time)}
          </p>
        )}
      </div>

      {/* شبكة الكروت */}
      <Board
        cards={cards}
        onCardClick={handleCardClick}
        pairsCount={getPairsCount()}
      />

      {/* رسالة الفوز */}
      {gameOver && (
        <p className="win-msg">
          🎉 You Won in {moves} moves! Time: {formatTime(time)} 🎉
        </p>
      )}
    </div>
  );
};

export default App;
