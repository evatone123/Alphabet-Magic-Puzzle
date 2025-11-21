import React, { useState } from 'react';
import { LetterGrid } from './components/LetterGrid';
import { GameRound } from './components/GameRound';
import { Reward } from './components/Reward';
import { GameState, RiddleData, Difficulty } from './types';
import { generateRiddle } from './services/gemini';
import { Baby, Brain, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [currentLetter, setCurrentLetter] = useState<string>('A');
  const [difficulty, setDifficulty] = useState<Difficulty>(Difficulty.EASY);
  const [riddleData, setRiddleData] = useState<RiddleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectLetter = async (letter: string) => {
    setCurrentLetter(letter);
    setGameState(GameState.LOADING_RIDDLE);
    setError(null);

    try {
      const data = await generateRiddle(letter, difficulty);
      setRiddleData(data);
      setGameState(GameState.PLAYING);
    } catch (e) {
      console.error(e);
      setError("Oops! My brain tickled. Try that letter again!");
      setGameState(GameState.MENU);
    }
  };

  const handleCorrect = () => {
    setGameState(GameState.SHOW_REWARD);
  };

  const handleBackToMenu = () => {
    setGameState(GameState.MENU);
    setRiddleData(null);
  };

  const handlePlayAgain = () => {
     setGameState(GameState.MENU);
     setRiddleData(null);
  };

  const getDifficultyColor = (d: Difficulty) => {
      switch(d) {
          case Difficulty.EASY: return 'bg-green-500 text-white shadow-lg scale-105';
          case Difficulty.MEDIUM: return 'bg-yellow-500 text-white shadow-lg scale-105';
          case Difficulty.HARD: return 'bg-red-500 text-white shadow-lg scale-105';
          default: return 'bg-gray-200 text-gray-500';
      }
  };

  return (
    <div className="min-h-screen bg-[#F0F9FF] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] font-fredoka">
      
      {/* Navbar */}
      <nav className="w-full bg-white shadow-sm p-4 flex justify-center items-center border-b-4 border-blue-100 sticky top-0 z-50">
         <div className="flex items-center space-x-2">
            <span className="text-2xl md:text-3xl">✨</span>
            <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                Alphabet Magic
            </h1>
            <span className="text-2xl md:text-3xl">✨</span>
         </div>
      </nav>

      <main className="container mx-auto pt-8 pb-20 px-4 flex flex-col items-center">
        
        {/* Error Banner */}
        {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded shadow-md max-w-lg w-full" role="alert">
                <p className="font-bold">Oh no!</p>
                <p>{error}</p>
            </div>
        )}

        {/* Screens */}
        {gameState === GameState.MENU && (
          <div className="flex flex-col items-center w-full">
            <div className="mb-6 flex items-center bg-white p-2 rounded-full shadow-sm border border-blue-100">
                <button 
                    onClick={() => setDifficulty(Difficulty.EASY)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold transition-all duration-200 ${difficulty === Difficulty.EASY ? getDifficultyColor(Difficulty.EASY) : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <Baby size={20} />
                    <span>Easy</span>
                </button>
                <button 
                    onClick={() => setDifficulty(Difficulty.MEDIUM)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold transition-all duration-200 ${difficulty === Difficulty.MEDIUM ? getDifficultyColor(Difficulty.MEDIUM) : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <Brain size={20} />
                    <span>Medium</span>
                </button>
                <button 
                    onClick={() => setDifficulty(Difficulty.HARD)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-full font-bold transition-all duration-200 ${difficulty === Difficulty.HARD ? getDifficultyColor(Difficulty.HARD) : 'text-gray-400 hover:bg-gray-50'}`}
                >
                    <GraduationCap size={20} />
                    <span>Hard</span>
                </button>
            </div>
            <LetterGrid onSelectLetter={handleSelectLetter} />
          </div>
        )}

        {gameState === GameState.LOADING_RIDDLE && (
          <div className="flex flex-col items-center justify-center mt-20 space-y-6">
             <div className="relative">
                <div className="w-24 h-24 border-8 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-4xl text-blue-500">
                    {currentLetter}
                </div>
             </div>
             <p className="text-2xl text-gray-600 font-bold animate-pulse">
                 Thinking of a riddle...
             </p>
          </div>
        )}

        {gameState === GameState.PLAYING && riddleData && (
          <GameRound 
            riddle={riddleData} 
            onCorrect={handleCorrect} 
            onBack={handleBackToMenu} 
          />
        )}

        {gameState === GameState.SHOW_REWARD && riddleData && (
          <Reward 
             answer={riddleData.answer}
             onNext={handlePlayAgain}
             onHome={handleBackToMenu}
          />
        )}

      </main>
      
      <footer className="fixed bottom-0 w-full bg-white/80 backdrop-blur-sm p-2 text-center text-gray-400 text-sm border-t border-gray-200">
         Powered by Google Gemini
      </footer>
    </div>
  );
};

export default App;