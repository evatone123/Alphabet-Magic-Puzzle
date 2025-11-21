import React, { useEffect, useState } from 'react';
import { generateRewardImage } from '../services/gemini';
import { RefreshCw, ArrowRight, Star, Download } from 'lucide-react';

interface RewardProps {
  answer: string;
  onNext: () => void;
  onHome: () => void;
}

export const Reward: React.FC<RewardProps> = ({ answer, onNext, onHome }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchImage = async () => {
      try {
        const url = await generateRewardImage(answer);
        if (isMounted) {
          setImageUrl(url);
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) setLoading(false);
      }
    };

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [answer]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-3xl mx-auto p-6 text-center animate-fade-in">
        <h2 className="text-5xl md:text-7xl font-bold text-green-500 mb-4 drop-shadow-md animate-bounce">
            Correct!
        </h2>
        <p className="text-2xl text-gray-600 mb-8">
            The answer is <span className="font-bold text-purple-600 uppercase">{answer}</span>!
        </p>

        <div className="relative w-64 h-64 md:w-96 md:h-96 bg-white rounded-3xl shadow-2xl border-8 border-yellow-300 flex items-center justify-center overflow-hidden mb-8">
            {loading ? (
                <div className="flex flex-col items-center space-y-4">
                    <RefreshCw className="w-16 h-16 text-yellow-400 animate-spin" />
                    <p className="text-yellow-500 font-bold text-xl">Painting your prize...</p>
                </div>
            ) : imageUrl ? (
                <img 
                    src={imageUrl} 
                    alt={answer} 
                    className="w-full h-full object-cover animate-scale-in"
                />
            ) : (
                <div className="text-gray-400 flex flex-col items-center">
                   <Star size={64} className="text-yellow-300 mb-2" />
                   <span>Couldn't paint it, but you're a star!</span>
                </div>
            )}
        </div>

        <div className="flex space-x-4">
            <button 
                onClick={onHome}
                className="px-8 py-4 bg-blue-500 text-white rounded-full font-bold text-xl shadow-lg hover:bg-blue-600 transition transform hover:scale-105"
            >
                Pick Letter
            </button>
            <button 
                onClick={onNext}
                className="px-8 py-4 bg-green-500 text-white rounded-full font-bold text-xl shadow-lg hover:bg-green-600 transition transform hover:scale-105 flex items-center space-x-2"
            >
                <span>Play Again</span>
                <ArrowRight size={24} />
            </button>
        </div>

        <style>{`
            @keyframes scale-in {
                from { transform: scale(0.5); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            .animate-scale-in {
                animation: scale-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
        `}</style>
    </div>
  );
};
