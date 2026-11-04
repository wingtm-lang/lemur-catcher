import React, { useState } from 'react';
import { Camera, Sparkles, Image as ImageIcon } from 'lucide-react';

interface BackgroundCameraButtonProps {
  onClick: () => void;
  hasCustomWallpaper: boolean;
  savedCount: number;
}

export const BackgroundCameraButton: React.FC<BackgroundCameraButtonProps> = ({
  onClick,
  hasCustomWallpaper,
  savedCount,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8 flex items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating Tooltip Pill */}
      <div
        className={`mr-3 px-3.5 py-1.5 rounded-2xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-xl shadow-slate-900/10 text-xs font-bold text-slate-800 pointer-events-none transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap ${
          isHovered
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 translate-x-2 scale-95 hidden sm:flex'
        }`}
      >
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        <span>Ganti Background</span>
        {savedCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono">
            {savedCount} foto
          </span>
        )}
      </div>

      {/* Camera Trigger Button */}
      <button
        type="button"
        onClick={onClick}
        aria-label="Ubah Background Aplikasi"
        id="btn-change-background"
        className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 hover:bg-white text-emerald-800 border-2 border-white/90 hover:border-emerald-500/80 shadow-2xl shadow-emerald-950/25 flex items-center justify-center backdrop-blur-2xl transition-all duration-300 hover:scale-110 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
      >
        {/* Soft emerald glow halo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-400/20 via-teal-300/30 to-emerald-500/20 blur-md pointer-events-none group-hover:scale-125 transition-transform" />

        {/* Camera Icon */}
        <Camera className="w-7 h-7 sm:w-8 sm:h-8 stroke-[2.2] text-emerald-700 group-hover:text-emerald-600 group-hover:rotate-6 transition-transform duration-300 relative z-10" />

        {/* Active Custom Indicator Badge */}
        {hasCustomWallpaper && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full z-20 flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>
        )}

        {/* Saved Count Badge */}
        {savedCount > 0 && !hasCustomWallpaper && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[20px] h-5 bg-teal-600 text-white font-mono text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center z-20 shadow-sm">
            {savedCount}
          </span>
        )}
      </button>
    </div>
  );
};
