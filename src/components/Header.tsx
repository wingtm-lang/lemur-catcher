import React from 'react';
import {
  Download,
  Settings,
  Trash2,
  RefreshCw,
  FileCode2,
  CheckCircle2,
  Video
} from 'lucide-react';
import { ExportFormat } from '../types';
import { LemurMascot } from './LemurMascot';
import mascotImg from '../assets/images/lemur_mascot_1786422171388.jpg';

interface HeaderProps {
  totalCount: number;
  doneCount: number;
  processingCount: number;
  errorCount: number;
  isProcessingZip: boolean;
  exportFormat: ExportFormat;
  onDownloadAllZip: () => void;
  onResetAllFrames: () => void;
  onClearAll: () => void;
  onOpenSettings: () => void;
  onOpenStandaloneModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  doneCount,
  processingCount,
  errorCount,
  isProcessingZip,
  exportFormat,
  onDownloadAllZip,
  onResetAllFrames,
  onClearAll,
  onOpenSettings,
  onOpenStandaloneModal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800/80 px-4 sm:px-8 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand & Stats */}
        <div className="flex items-center gap-3">
          <LemurMascot
            size="sm"
            state={processingCount > 0 ? 'processing' : doneCount > 0 ? 'celebrate' : 'idle'}
            imageSrc={mascotImg}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2">
                Lemur Catcher
                <span className="text-teal-300 font-medium text-xs px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center gap-1">
                  <span>🐾</span> Video Jahit Bulk
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ekstrak 1 frame terbaik dari video menjahit & unduh massal presisi
            </p>
          </div>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center flex-wrap gap-2.5">
          {totalCount > 0 && (
            <>
              {/* Stats badges */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <Video className="w-3.5 h-3.5 text-teal-400" />
                  {totalCount} Total
                </span>
                <span className="text-slate-600">•</span>
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {doneCount} Siap
                </span>
                {processingCount > 0 && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-amber-300 font-medium animate-pulse">
                      {processingCount} Diproses
                    </span>
                  </>
                )}
                {errorCount > 0 && (
                  <>
                    <span className="text-slate-600">•</span>
                    <span className="text-rose-400 font-medium">
                      {errorCount} Gagal
                    </span>
                  </>
                )}
              </div>

              {/* Reset All to 50% */}
              <button
                onClick={onResetAllFrames}
                disabled={processingCount > 0}
                className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium flex items-center gap-1.5 transition-all disabled:opacity-50"
                title="Selesaikan ulang otomatis capture frame ke 50% durasi untuk semua video"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden sm:inline">Reset Frame 50%</span>
              </button>

              {/* Download All ZIP */}
              <button
                onClick={onDownloadAllZip}
                disabled={doneCount === 0 || isProcessingZip}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                id="btn-download-zip"
              >
                {isProcessingZip ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Mengompresi ZIP...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 stroke-[2.5]" />
                    <span>Unduh Semua (.ZIP)</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded bg-slate-950/20 text-[10px] uppercase font-mono">
                      {exportFormat}
                    </span>
                  </>
                )}
              </button>

              {/* Clear All */}
              <button
                onClick={onClearAll}
                className="px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 border border-slate-700/60 hover:border-rose-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Hapus semua video dalam antrean"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Hapus Semua</span>
              </button>
            </>
          )}

          {/* Quick Settings */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-colors"
            title="Pengaturan Format & Kualitas Capture"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Standalone HTML Exporter */}
          <button
            onClick={onOpenStandaloneModal}
            className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-teal-300 border border-teal-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Unduh versi Single HTML Standalone (Offline ready)"
          >
            <FileCode2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden md:inline">Single HTML File</span>
          </button>
        </div>
      </div>
    </header>
  );
};

