import React, { useState } from 'react';
import { motion } from 'motion/react';

interface LemurMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  state?: 'idle' | 'searching' | 'processing' | 'done' | 'celebrate';
  showSpeechBubble?: boolean;
  speechText?: string;
  imageSrc?: string;
}

export const LemurMascot: React.FC<LemurMascotProps> = ({
  size = 'md',
  state = 'idle',
  showSpeechBubble = false,
  speechText = 'Siap tangkap frame!',
  imageSrc = '/ab23f2ab5e0fba2456c6e79071b4887c.jpg',
}) => {
  const [currentSrc, setCurrentSrc] = useState(imageSrc);
  const [hasError, setHasError] = useState(false);

  const containerDimensions = {
    sm: 'w-14 h-14',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
    xl: 'w-36 h-36',
    '2xl': 'w-48 h-48',
  }[size];

  const speechOffsets = {
    sm: '-top-7 text-[10px]',
    md: '-top-9 text-xs',
    lg: '-top-10 text-xs',
    xl: '-top-12 text-sm',
    '2xl': '-top-14 text-sm',
  }[size];

  const handleImageError = () => {
    if (currentSrc === '/ab23f2ab5e0fba2456c6e79071b4887c.jpg') {
      setCurrentSrc('/lemur.png');
    } else if (currentSrc === '/lemur.png') {
      setCurrentSrc('/lemur.jpg');
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="relative inline-flex flex-col items-center select-none group">
      {/* Speech bubble */}
      {showSpeechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className={`absolute ${speechOffsets} z-30 px-4 py-1.5 bg-white/95 border border-white text-emerald-900 font-bold font-handwriting text-lg md:text-xl rounded-2xl shadow-xl shadow-slate-900/10 backdrop-blur-2xl whitespace-nowrap flex items-center gap-2`}
        >
          <span className="text-emerald-600 animate-bounce">🐾</span>
          <span>{speechText}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-white rotate-45" />
        </motion.div>
      )}

      {/* Pop-Out Mascot Stage */}
      <motion.div
        animate={
          state === 'processing'
            ? { y: [0, -8, 0], rotate: [-2, 2, -2] }
            : state === 'celebrate'
            ? { y: [0, -14, 0], scale: [1, 1.1, 1] }
            : { y: [0, -4, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: state === 'processing' ? 1.2 : state === 'celebrate' ? 0.6 : 3.5,
          ease: 'easeInOut',
        }}
        className={`relative ${containerDimensions} flex items-end justify-center`}
      >
        {/* Soft glowing aura under mascot */}
        <div className="absolute bottom-0 w-[88%] h-[88%] rounded-3xl bg-emerald-400/20 blur-xl pointer-events-none group-hover:bg-emerald-400/35 transition-all duration-500" />

        {/* Mascot Container - Pop Out / Clean Image Presentation */}
        <div className="relative z-10 w-full h-full flex items-center justify-center overflow-visible pointer-events-none">
          {!hasError ? (
            <img
              src={currentSrc}
              alt="Lemur Mascot"
              onError={handleImageError}
              className="w-full h-full object-contain rounded-3xl shadow-2xl shadow-slate-900/10 border-2 border-white/80 transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-[85%] h-[85%] rounded-3xl bg-white/80 border border-white flex items-center justify-center text-4xl shadow-xl">
              🐾
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};


