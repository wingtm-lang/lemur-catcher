import React from 'react';
import { LemurMascot } from './LemurMascot';
import mascotImg from '../assets/images/lemur_mascot_1786422171388.jpg';

interface ProgressBarProps {
  progressPercent: number; // 0 to 100
  title: string;
  subtitle?: string;
  isVisible: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progressPercent,
  title,
  subtitle,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="w-full bg-slate-900/80 border border-teal-500/30 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 my-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <LemurMascot size="sm" state="processing" imageSrc={mascotImg} />
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              {title}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                🐾 Lemur Working
              </span>
            </h3>
            {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        <span className="text-sm font-mono font-bold text-teal-300 shrink-0">
          {Math.round(progressPercent)}%
        </span>
      </div>

      <div className="w-full h-2.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/80">
        <div
          className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 rounded-full transition-all duration-300 shadow-sm"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </div>
  );
};

