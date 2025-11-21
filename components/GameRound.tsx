import React, { useEffect, useState, useRef } from 'react';
import { RiddleData } from '../types';
import { generateSpeech } from '../services/gemini';
import { Volume2, ArrowLeft, Sparkles } from 'lucide-react';

interface GameRoundProps {
  riddle: RiddleData;
  onCorrect: () => void;
  onBack: () => void;
}

export const GameRound: React.FC<GameRoundProps> = ({ riddle, onCorrect, onBack }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isWrong, setIsWrong] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playRiddleAudio = async () => {
    if (!audioContextRef.current) return;
    
    setIsPlayingAudio(true);
    try {
        // Resume context if suspended (browsers often suspend audio context until user interaction)
       if (audioContextRef.current.state === 'suspended') {
           await audioContextRef.current.resume();
       }

       const buffer = await generateSpeech(riddle.question, audioContextRef.current);
       if (buffer) {
         const source = audioContextRef.current.createBufferSource();
         source.buffer = buffer;
         source.connect(audioContextRef.current.destination);
         source.onended = () => setIsPlayingAudio(false);
         source.start();
       } else {
           setIsPlayingAudio(false);
       }
    } catch (e) {
        console.error("Audio play failed", e);
        setIsPlayingAudio(false);
    }
  };

  // Auto-play audio on mount once
  useEffect(() => {
    const timer = setTimeout(() => {
        playRiddleAudio();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riddle]);

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
    if (option === riddle.answer) {
      // Correct!
      // Play a generic success sound or TTS "Correct!"? Let's just move to state.
      const snd = new Audio('https://actions.google.com/sounds/v1/cartoon/pop.ogg'); // Simple open sound if available, else silent
      snd.play().catch(() => {});
      onCorrect();
    } else {
      // Wrong
      setIsWrong(true);
      const snd = new Audio('https://actions.google.com/sounds/v1/cartoon/clank_car_crash.ogg'); // funny fail sound
      snd.volume = 0.2;
      snd.play().catch(() => {});
      
      setTimeout(() => {
        setIsWrong(false);
        setSelectedOption(null);
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 flex flex-col items-center animate-fade-in">
        {/* Header / Back */}
        <div className="w-full flex items-center justify-between mb-6">
            <button onClick={onBack} className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition text-gray-700">
                <ArrowLeft size={32} />
            </button>
            <div className="text-6xl font-bold text-purple-600 drop-shadow-md">{riddle.letter}</div>
            <div className="w-12"></div> {/* Spacer */}
        </div>

        {/* Riddle Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 w-full border-b-8 border-purple-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>
            
            <div className="flex flex-col items-center text-center space-y-4">
                <p className="text-2xl md:text-4xl font-medium text-gray-800 leading-relaxed">
                    "{riddle.question}"
                </p>
                
                <button 
                    onClick={playRiddleAudio}
                    disabled={isPlayingAudio}
                    className={`
                        flex items-center space-x-2 px-6 py-3 rounded-full font-bold text-lg transition-all
                        ${isPlayingAudio 
                            ? 'bg-purple-100 text-purple-400' 
                            : 'bg-purple-500 text-white hover:bg-purple-600 hover:scale-105 shadow-md'}
                    `}
                >
                    <Volume2 size={24} className={isPlayingAudio ? 'animate-pulse' : ''} />
                    <span>{isPlayingAudio ? 'Reading...' : 'Read to Me'}</span>
                </button>
            </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            {riddle.options.map((option) => {
                const isSelected = selectedOption === option;
                const isCorrectAnswer = option === riddle.answer;
                
                // Styles for wrong state
                const wrongStyle = isSelected && isWrong ? 'bg-red-500 text-white shake-animation' : 'bg-white text-gray-700 hover:bg-blue-50';
                
                return (
                    <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className={`
                            relative overflow-hidden
                            py-6 px-8 rounded-2xl text-2xl md:text-3xl font-bold
                            shadow-md border-b-4 border-gray-200
                            transition-all duration-100 active:border-b-0 active:translate-y-1
                            flex items-center justify-center group
                            ${wrongStyle}
                        `}
                    >
                        <span className="relative z-10 group-hover:scale-110 transition-transform">{option}</span>
                        {isSelected && isWrong && (
                            <span className="absolute inset-0 bg-red-100 opacity-20 animate-pulse"></span>
                        )}
                    </button>
                );
            })}
        </div>
        
        <style>{`
            .shake-animation {
                animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
            }
            @keyframes shake {
                10%, 90% { transform: translate3d(-1px, 0, 0); }
                20%, 80% { transform: translate3d(2px, 0, 0); }
                30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                40%, 60% { transform: translate3d(4px, 0, 0); }
            }
        `}</style>
    </div>
  );
};
