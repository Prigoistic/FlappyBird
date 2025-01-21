import React, { useState, useEffect, useCallback } from 'react';

interface Pipe {
  x: number;
  height: number;
}

function App() {
  const [birdPosition, setBirdPosition] = useState(250);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<Pipe[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gravity = 0.5;
  const jumpForce = -10;
  const pipeWidth = 60;
  const gap = 150;
  const birdSize = 30;

  const jump = useCallback(() => {
    if (!gameOver) {
      setBirdVelocity(jumpForce);
      if (!gameStarted) {
        setGameStarted(true);
      }
    }
  }, [gameOver, gameStarted]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [jump]);

  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = setInterval(() => {
      // Update bird position
      setBirdPosition((prev) => {
        const newPosition = prev + birdVelocity;
        if (newPosition > 500 || newPosition < 0) {
          setGameOver(true);
          return prev;
        }
        return newPosition;
      });

      // Update bird velocity
      setBirdVelocity((prev) => prev + gravity);

      // Update pipes
      setPipes((prevPipes) => {
        const newPipes = prevPipes
          .map((pipe) => ({ ...pipe, x: pipe.x - 2 }))
          .filter((pipe) => pipe.x > -pipeWidth);

        // Add new pipe
        if (prevPipes.length === 0 || prevPipes[prevPipes.length - 1].x < 300) {
          const height = Math.random() * (400 - gap) + 100;
          newPipes.push({ x: 800, height });
        }

        return newPipes;
      });

      // Check collisions
      pipes.forEach((pipe) => {
        if (
          pipe.x < 100 + birdSize &&
          pipe.x + pipeWidth > 100 &&
          (birdPosition < pipe.height || birdPosition + birdSize > pipe.height + gap)
        ) {
          setGameOver(true);
        }
      });

      // Update score
      pipes.forEach((pipe) => {
        if (pipe.x + pipeWidth === 98) {
          setScore((prev) => prev + 1);
        }
      });
    }, 1000 / 60);

    if (gameOver) {
      clearInterval(gameLoop);
    }

    return () => clearInterval(gameLoop);
  }, [gameStarted, birdVelocity, pipes, gameOver]);

  const resetGame = () => {
    setBirdPosition(250);
    setBirdVelocity(0);
    setPipes([]);
    setGameStarted(false);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-blue-400 to-blue-600 flex items-center justify-center"
      onClick={jump}
    >
      <div className="relative w-[800px] h-[500px] bg-blue-300 overflow-hidden border-4 border-white rounded-lg shadow-xl">
        {/* Bird */}
        <div
          className="absolute w-[30px] h-[30px] rounded-full bg-yellow-400 transition-transform"
          style={{
            left: '100px',
            top: `${birdPosition}px`,
            transform: `rotate(${birdVelocity * 4}deg)`,
          }}
        />

        {/* Pipes */}
        {pipes.map((pipe, index) => (
          <React.Fragment key={index}>
            {/* Top pipe */}
            <div
              className="absolute bg-green-500 border-r-4 border-l-4 border-green-700"
              style={{
                left: `${pipe.x}px`,
                top: 0,
                width: `${pipeWidth}px`,
                height: `${pipe.height}px`,
              }}
            />
            {/* Bottom pipe */}
            <div
              className="absolute bg-green-500 border-r-4 border-l-4 border-green-700"
              style={{
                left: `${pipe.x}px`,
                top: `${pipe.height + gap}px`,
                width: `${pipeWidth}px`,
                height: `${500 - (pipe.height + gap)}px`,
              }}
            />
          </React.Fragment>
        ))}

        {/* Score */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-white shadow-text">
          {score}
        </div>

        {/* Start/Game Over Message */}
        {!gameStarted && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Flappy Bird</h1>
              <p>Click or press Space to start</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-center">
              <h1 className="text-4xl font-bold mb-4">Game Over!</h1>
              <p className="text-2xl mb-4">Score: {score}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  resetGame();
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;