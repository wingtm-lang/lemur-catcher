import React from 'react';
import { motion } from 'motion/react';

interface LemurMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
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
  imageSrc,
}) => {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  }[size];

  return (
    <div className="relative inline-flex flex-col items-center select-none group">
      {/* Speech bubble */}
      {showSpeechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 5, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="absolute -top-10 z-20 px-3 py-1 bg-slate-800/90 border border-teal-500/30 text-teal-200 text-[11px] font-semibold rounded-full shadow-lg backdrop-blur-md whitespace-nowrap flex items-center gap-1.5"
        >
          <span className="animate-pulse">🐾</span>
          {speechText}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 border-r border-b border-teal-500/30 rotate-45" />
        </motion.div>
      )}

      {/* Mascot Image or Animated SVG */}
      <motion.div
        animate={
          state === 'processing'
            ? { y: [0, -6, 0], rotate: [-2, 2, -2] }
            : state === 'celebrate'
            ? { y: [0, -12, 0], scale: [1, 1.08, 1] }
            : { y: [0, -2, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: state === 'processing' ? 1.2 : state === 'celebrate' ? 0.6 : 3,
          ease: 'easeInOut',
        }}
        className={`relative ${sizeClasses} rounded-2xl p-1 bg-gradient-to-br from-teal-500/20 via-slate-800 to-amber-500/20 border border-teal-500/30 shadow-xl flex items-center justify-center overflow-hidden`}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Lemur Catcher Mascot"
            className="w-full h-full object-cover rounded-xl"
            referrerPolicy="no-referrer"
          />
        ) : (
          /* SVG Vector Lemur with Wiggling Ringed Tail & Big Eyes */
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full text-teal-300"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Wiggling Ringed Tail */}
            <motion.path
              d="M 25 75 C 10 70 5 45 15 30 C 25 15 45 20 35 35 C 30 45 40 55 50 65"
              stroke="currentColor"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="4 4"
              animate={{ rotate: [-5, 8, -5], originX: 0.5, originY: 0.8 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            />

            {/* Body */}
            <ellipse cx="50" cy="65" rx="22" ry="20" fill="#334155" />
            <ellipse cx="50" cy="67" rx="14" ry="14" fill="#f8fafc" opacity="0.9" />

            {/* Ears */}
            <circle cx="32" cy="35" r="9" fill="#475569" />
            <circle cx="32" cy="35" r="5" fill="#f43f5e" opacity="0.6" />
            <circle cx="68" cy="35" r="9" fill="#475569" />
            <circle cx="68" cy="35" r="5" fill="#f43f5e" opacity="0.6" />

            {/* Head */}
            <circle cx="50" cy="42" r="20" fill="#334155" />
            {/* White face mask characteristic of Lemurs */}
            <path
              d="M 34 38 C 34 30 66 30 66 38 C 66 52 34 52 34 38 Z"
              fill="#f8fafc"
            />
            {/* Dark eye rings */}
            <circle cx="42" cy="40" r="6" fill="#1e293b" />
            <circle cx="58" cy="40" r="6" fill="#1e293b" />

            {/* Big Amber Lemur Eyes */}
            <circle cx="42" cy="40" r="4.5" fill="#f59e0b" />
            <circle cx="58" cy="40" r="4.5" fill="#f59e0b" />
            <circle cx="42" cy="40" r="2.5" fill="#0f172a" />
            <circle cx="58" cy="40" r="2.5" fill="#0f172a" />
            {/* Eye glints */}
            <circle cx="40.5" cy="38.5" r="1.2" fill="#ffffff" />
            <circle cx="56.5" cy="38.5" r="1.2" fill="#ffffff" />

            {/* Cute Snout */}
            <polygon points="50,45 47,48 53,48" fill="#1e293b" />
            <path d="M 47 50 Q 50 52 53 50" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" />

            {/* Tail Rings indicator */}
            <path
              d="M 20 35 C 18 30 22 25 28 22"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </motion.div>
    </div>
  );
};
