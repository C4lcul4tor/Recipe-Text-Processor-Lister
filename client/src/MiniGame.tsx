// MiniGame.tsx
import { useEffect, useState } from "react";

const INGREDIENTS = ["🍅", "🥕", "🧄", "🍞", "🥦", "🥚"];

interface Drop {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

interface MiniGameProps {
  onGameComplete: () => void;
}

export default function MiniGame({ onGameComplete }: MiniGameProps) {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    if (score >= 1 && !gameOver) {
      setGameOver(true);
      setTimeout(onGameComplete, 2000); // Wait 2s before continuing
    }
  }, [score, gameOver, onGameComplete]);

  // Create falling drops
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setDrops((prev) => [
        ...prev,
        {
          id: Date.now(),
          emoji: INGREDIENTS[Math.floor(Math.random() * INGREDIENTS.length)],
          x: Math.random() * 90,
          y: 0,
        },
      ]);
    }, 1000); // Slower drop spawn rate

    return () => clearInterval(interval);
  }, [gameOver]);

  // Move drops down
  useEffect(() => {
    if (gameOver) return;

    const gravity = setInterval(() => {
      setDrops((prev) =>
        prev
          .map((drop) => ({ ...drop, y: drop.y + 2 })) // Slower fall
          .filter((drop) => drop.y < 100)
      );
    }, 100);
    return () => clearInterval(gravity);
  }, [gameOver]);

  const handleCatch = (id: number) => {
    setScore((prev) => prev + 1);
    setDrops((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-b from-amber-100 to-yellow-200 text-center relative overflow-hidden">
      <h1 className="text-3xl font-bold mb-2">🍳 Catch the Ingredient!</h1>
      <p className="mb-4">Tap the falling items to score!</p>
      <div className="text-xl font-semibold mb-8">Score: {score}</div>

      {gameOver && (
        <div className="absolute bottom-6 bg-green-100 text-green-800 font-medium px-4 py-2 rounded shadow">
          ✅ Game complete! Loading app...
        </div>
      )}

      <div className="absolute top-0 left-0 w-full h-full">
        {drops.map((drop) => (
          <div
            key={drop.id}
            onClick={() => handleCatch(drop.id)}
            className="absolute text-3xl cursor-pointer transition-transform duration-100"
            style={{ top: `${drop.y}%`, left: `${drop.x}%` }}
          >
            {drop.emoji}
          </div>
        ))}
      </div>
    </div>
  );
}
