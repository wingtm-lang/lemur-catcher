import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Camera, Sparkles } from 'lucide-react';
import {
  SpeechFont,
  SpeechMovingObject,
  SPEECH_FONT_OPTIONS,
} from '../utils/mascotStorage';

interface LemurMascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  state?: 'idle' | 'searching' | 'processing' | 'done' | 'celebrate';
  showSpeechBubble?: boolean;
  speechText?: string;
  speechFont?: SpeechFont;
  movingObject?: SpeechMovingObject;
  imageSrc?: string;
  onEditClick?: () => void;
  onCustomizeBubble?: () => void;
}

export const renderSpeechMovingObject = (
  type: SpeechMovingObject | string = 'paws',
  pos: 'left' | 'right' = 'left'
) => {
  switch (type) {
    case 'paws':
      return (
        <span
          className={`text-emerald-600 animate-bounce inline-block text-base leading-none select-none ${
            pos === 'right' ? '[animation-delay:200ms]' : ''
          }`}
          title="Jejak Kaki Lemur"
        >
          🐾
        </span>
      );
    case 'stars':
      return (
        <span
          className={`text-amber-400 animate-twinkle inline-block text-base leading-none select-none ${
            pos === 'right' ? '[animation-delay:400ms]' : ''
          }`}
          title="Bintang Berkilau"
        >
          ✨
        </span>
      );
    case 'butterfly':
      return (
        <span
          className={`inline-block animate-flutter filter drop-shadow-sm text-base leading-none select-none ${
            pos === 'right' ? '[animation-delay:500ms] scale-x-[-1]' : ''
          }`}
          title="Kupu-kupu Menari"
        >
          🦋
        </span>
      );
    case 'needle':
      return (
        <span
          className={`inline-flex items-center gap-0.5 animate-swing-music text-base leading-none select-none ${
            pos === 'right' ? '[animation-delay:350ms]' : ''
          }`}
          title="Jarum & Benang Menjahit"
        >
          <span>🪡</span>
          <span className="text-xs text-rose-500">🧵</span>
        </span>
      );
    case 'hearts':
      return (
        <span
          className={`text-rose-500 animate-pulse-heart inline-block text-base leading-none select-none ${
            pos === 'right' ? '[animation-delay:300ms]' : ''
          }`}
          title="Hati Berdenyut"
        >
          💖
        </span>
      );
    case 'music':
      return (
        <span
          className={`text-indigo-500 animate-swing-music inline-block text-base leading-none select-none ${
            pos === 'right' ? '[animation-delay:450ms]' : ''
          }`}
          title="Not Nada Irama"
        >
          🎵
        </span>
      );
    case 'bubbles':
      return (
        <span
          className={`animate-bubble inline-block text-base leading-none select-none ${
            pos === 'right' ? '[animation-delay:600ms]' : ''
          }`}
          title="Gelembung Udara"
        >
          🫧
        </span>
      );
    case 'flower':
      return (
        <span
          className={`text-pink-400 animate-flutter inline-block text-base leading-none select-none ${
            pos === 'right' ? '[animation-delay:500ms]' : ''
          }`}
          title="Bunga Sakura Mekar"
        >
          🌸
        </span>
      );
    case 'scissors':
      return (
        <span
          className={`text-teal-600 animate-scissors inline-block text-base leading-none select-none ${
            pos === 'right' ? '[animation-delay:300ms]' : ''
          }`}
          title="Gunting Menjahit"
        >
          ✂️
        </span>
      );
    case 'none':
    default:
      return null;
  }
};

export const LemurMascot: React.FC<LemurMascotProps> = ({
  size = 'md',
  state = 'idle',
  showSpeechBubble = false,
  speechText = 'Siap tangkap frame!',
  speechFont = 'caveat',
  movingObject = 'paws',
  imageSrc = '/ab23f2ab5e0fba2456c6e79071b4887c.jpg',
  onEditClick,
  onCustomizeBubble,
}) => {
  const [currentSrc, setCurrentSrc] = useState(imageSrc);
  const [hasError, setHasError] = useState(false);

  const fontOption = SPEECH_FONT_OPTIONS.find((f) => f.id === speechFont);
  const activeFontClass = fontOption?.fontClass || 'font-handwriting';

  useEffect(() => {
    setCurrentSrc(imageSrc);
    setHasError(false);
  }, [imageSrc]);

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

  const handleBubbleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onCustomizeBubble) {
      onCustomizeBubble();
    } else if (onEditClick) {
      onEditClick();
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
          onClick={handleBubbleClick}
          className={`absolute ${speechOffsets} z-30 px-4 py-2 bg-white/95 border border-white text-emerald-950 font-bold ${activeFontClass} text-lg md:text-xl rounded-2xl shadow-xl shadow-slate-900/10 backdrop-blur-2xl whitespace-nowrap flex items-center gap-2.5 transition-all duration-200 ${
            onCustomizeBubble || onEditClick
              ? 'cursor-pointer hover:scale-105 active:scale-95 hover:border-emerald-300 hover:shadow-emerald-500/10'
              : ''
          }`}
          title="Klik untuk menyesuaikan font & objek bergerak gelembung bicara"
        >
          {/* Left Moving Object */}
          {movingObject !== 'none' && renderSpeechMovingObject(movingObject, 'left')}

          {/* Speech Text */}
          <span className="tracking-wide">{speechText}</span>

          {/* Right Moving Object */}
          {movingObject !== 'none' && renderSpeechMovingObject(movingObject, 'right')}

          {/* Pointer Triangle */}
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
        <div
          onClick={(e) => {
            if (onEditClick) {
              e.stopPropagation();
              onEditClick();
            }
          }}
          className={`relative z-10 w-full h-full flex items-center justify-center overflow-visible ${
            onEditClick ? 'cursor-pointer pointer-events-auto' : 'pointer-events-none'
          }`}
          title={onEditClick ? 'Klik untuk mengganti foto karakter/maskot ini' : undefined}
        >
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

          {/* Interactive Edit Camera Badge */}
          {onEditClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditClick();
              }}
              className="absolute -top-2.5 -right-2.5 z-40 p-2.5 rounded-full bg-white/95 hover:bg-emerald-600 text-emerald-800 hover:text-white border-2 border-emerald-400/60 shadow-xl shadow-slate-900/15 hover:scale-115 active:scale-95 transition-all duration-200 pointer-events-auto flex items-center justify-center group/btn"
              title="Ganti Foto Karakter Ini (Unggah Sendiri)"
              aria-label="Ganti Gambar Maskot"
            >
              <Camera className="w-4 h-4 stroke-[2.2]" />
            </button>
          )}

          {/* Hover hint badge */}
          {onEditClick && (
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-30 whitespace-nowrap">
              <span className="px-2.5 py-1 rounded-full bg-slate-900/80 text-white text-[11px] font-hand-story font-bold shadow-lg backdrop-blur-sm flex items-center gap-1">
                <Camera className="w-3 h-3 text-emerald-400" />
                <span>Ganti Gambar</span>
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};


