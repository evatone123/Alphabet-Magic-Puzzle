import React from 'react';

interface LetterGridProps {
  onSelectLetter: (letter: string) => void;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-amber-400', 'bg-green-400',
  'bg-emerald-400', 'bg-teal-400', 'bg-cyan-400', 'bg-sky-400',
  'bg-blue-400', 'bg-indigo-400', 'bg-violet-400', 'bg-purple-400',
  'bg-fuchsia-400', 'bg-pink-400', 'bg-rose-400'
];

export const LetterGrid: React.FC<LetterGridProps> = ({ onSelectLetter }) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-4xl md:text-6xl font-bold text-center text-blue-600 mb-8 drop-shadow-sm">
        Pick a Letter!
      </h1>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {ALPHABET.map((letter, index) => {
          const colorClass = COLORS[index % COLORS.length];
          return (
            <button
              key={letter}
              onClick={() => onSelectLetter(letter)}
              className={`
                ${colorClass} 
                text-white text-5xl font-bold rounded-3xl p-6 
                shadow-lg transform transition-all duration-200 
                hover:scale-110 hover:-translate-y-2 hover:shadow-xl 
                active:scale-95
                aspect-square flex items-center justify-center
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};
