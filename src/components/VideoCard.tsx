import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Trash2,
  Video as VideoIcon,
  Image as ImageIcon,
  Play,
  Pause,
  RotateCcw,
  Maximize2,
  Check,
  AlertCircle,
  Sliders,
  Sparkles,
  Edit2
} from 'lucide-react';
import { VideoItem } from '../types';
import { formatFileSize, formatTime } from '../utils/videoUtils';

interface VideoCardProps {
  item: VideoItem;
  onTimeChange: (id: string, newTime: number) => void;
  onDownloadSingle: (id: string) => void;
  onRemove: (id: string) => void;
  onFormatChange: (id: string, format: 'jpg' | 'png' | 'webp') => void;
  onRename: (id: string, newBaseName: string) => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  item,
  onTimeChange,
  onDownloadSingle,
  onRemove,
  onFormatChange,
  onRename,
}) => {
  const [viewMode, setViewMode] = useState<'preview' | 'video'>('preview');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(item.baseName);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setTempName(item.baseName);
  }, [item.baseName]);

  // Sync video element time if in video mode
  useEffect(() => {
    if (viewMode === 'video' && videoRef.current) {
      if (Math.abs(videoRef.current.currentTime - item.currentTime) > 0.2) {
        videoRef.current.currentTime = item.currentTime;
      }
    }
  }, [item.currentTime, viewMode]);

  const handleVideoTimeUpdate = () => {
    if (videoRef.current && isPlaying) {
      onTimeChange(item.id, videoRef.current.currentTime);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const captureCurrentPlayhead = () => {
    if (videoRef.current) {
      onTimeChange(item.id, videoRef.current.currentTime);
    }
  };

  const handleNameSave = () => {
    if (tempName.trim()) {
      onRename(item.id, tempName.trim());
    } else {
      setTempName(item.baseName);
    }
    setIsEditingName(false);
  };

  const statusBadge = {
    queued: {
      color: 'bg-slate-800 text-slate-300 border-slate-700',
      label: 'Antrean',
    },
    processing: {
      color: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      label: 'Mencapture Frame...',
    },
    done: {
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      label: 'Frame Siap 🐾',
    },
    error: {
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      label: 'Gagal',
    },
  }[item.status];

  return (
    <div
      className={`group bg-slate-900/90 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col shadow-xl ${
        item.status === 'processing'
          ? 'border-teal-500/50 shadow-teal-500/5'
          : item.status === 'done'
          ? 'border-slate-800 hover:border-teal-500/40'
          : 'border-rose-500/40'
      }`}
      id={`video-card-${item.id}`}
    >
      {/* Top Header Bar */}
      <div className="p-3.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 shrink-0">
            {viewMode === 'preview' ? (
              <ImageIcon className="w-4 h-4 text-teal-400" />
            ) : (
              <VideoIcon className="w-4 h-4 text-sky-400" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  autoFocus
                  className="bg-slate-800 border border-teal-500/50 text-white text-xs px-2 py-0.5 rounded focus:outline-none w-full"
                />
                <button
                  onClick={handleNameSave}
                  className="p-1 rounded bg-teal-500 text-slate-950 hover:bg-teal-400"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 group/title">
                <h4
                  className="text-xs font-semibold text-slate-200 truncate cursor-pointer hover:text-teal-300 transition-colors"
                  title={`Output: ${item.outputFilename} (Klik untuk edit nama file)`}
                  onClick={() => setIsEditingName(true)}
                >
                  {item.outputFilename}
                </h4>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="text-slate-500 hover:text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity p-0.5"
                  title="Edit Nama File Output"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400 truncate">
              Asli: {item.name} ({formatFileSize(item.size)})
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${statusBadge.color}`}
          >
            {statusBadge.label}
          </span>
          <button
            onClick={() => onRemove(item.id)}
            className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Hapus video ini"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Media Display Container (Image Preview or Video Player) */}
      <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group/media">
        {item.status === 'processing' ? (
          <div className="absolute inset-0 z-20 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="w-8 h-8 border-3 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-medium text-teal-300">
              Mengekstrak frame ({formatTime(item.currentTime)})...
            </p>
          </div>
        ) : null}

        {item.status === 'error' ? (
          <div className="p-6 text-center text-rose-300 flex flex-col items-center gap-2">
            <AlertCircle className="w-8 h-8 text-rose-400" />
            <p className="text-xs">{item.errorMessage || 'Gagal memuat video.'}</p>
          </div>
        ) : viewMode === 'preview' && item.capturedImageUrl ? (
          /* Captured Frame Preview */
          <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
            <img
              src={item.capturedImageUrl}
              alt={item.outputFilename}
              className="max-w-full max-h-full object-contain transition-transform duration-300"
            />
            {/* View overlay options */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 opacity-0 group-hover/media:opacity-100 transition-opacity bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg p-1">
              <button
                onClick={() => setViewMode('video')}
                className="px-2 py-1 text-[10px] font-medium text-sky-300 hover:bg-sky-500/20 rounded flex items-center gap-1"
                title="Buka pemutar video interaktif"
              >
                <VideoIcon className="w-3 h-3" /> Pemutar Video
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Video Player */
          <div className="relative w-full h-full bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={item.objectUrl}
              playsInline
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="max-w-full max-h-full object-contain"
            />
            {/* Overlay video controls */}
            <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800">
              <button
                onClick={togglePlayPause}
                className="p-1.5 rounded-md bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                title={isPlaying ? 'Pause Video' : 'Play Video'}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={captureCurrentPlayhead}
                className="px-2.5 py-1 rounded-md bg-teal-500 text-slate-950 font-bold text-[11px] flex items-center gap-1 hover:bg-teal-400 transition-colors"
                title="Tangkap frame di detik saat ini"
              >
                <Sparkles className="w-3 h-3" /> Tangkap Frame Ini
              </button>

              <button
                onClick={() => setViewMode('preview')}
                className="px-2 py-1 text-[10px] text-slate-300 hover:bg-slate-800 rounded"
              >
                Kembali ke Preview
              </button>
            </div>
          </div>
        )}

        {/* View Mode Switcher Pill */}
        <div className="absolute top-2 left-2 z-10 flex items-center bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg p-0.5 text-[10px] font-medium">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              viewMode === 'preview'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3 h-3" /> Preview
          </button>
          <button
            onClick={() => setViewMode('video')}
            className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 ${
              viewMode === 'video'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <VideoIcon className="w-3 h-3" /> Video
          </button>
        </div>
      </div>

      {/* Controls & Scrubbing Area */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-slate-900/60">
        {/* Timeline Slider & Time Display */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
            <span className="font-mono text-[11px] text-teal-300 font-semibold flex items-center gap-1">
              <Sliders className="w-3 h-3 text-teal-400" /> Detik: {formatTime(item.currentTime)}
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              Durasi: {formatTime(item.duration)}
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={item.duration || 100}
            step={0.1}
            value={item.currentTime}
            onChange={(e) => onTimeChange(item.id, parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400 focus:outline-none"
            id={`scrubber-${item.id}`}
          />

          {/* Quick Adjustment Buttons */}
          <div className="flex items-center justify-between gap-1 mt-2.5">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onTimeChange(item.id, Math.max(0, item.currentTime - 1))}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors"
                title="Mundur 1 Detik"
              >
                -1.0s
              </button>
              <button
                onClick={() => onTimeChange(item.id, Math.max(0, item.currentTime - 0.2))}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors"
                title="Mundur 0.2 Detik (Presisi Jarum)"
              >
                -0.2s
              </button>
              <button
                onClick={() => onTimeChange(item.id, Math.min(item.duration, item.currentTime + 0.2))}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors"
                title="Maju 0.2 Detik (Presisi Jarum)"
              >
                +0.2s
              </button>
              <button
                onClick={() => onTimeChange(item.id, Math.min(item.duration, item.currentTime + 1))}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono transition-colors"
                title="Maju 1 Detik"
              >
                +1.0s
              </button>
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onTimeChange(item.id, item.duration * 0.25)}
                className="px-1.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono"
                title="Capture di 25% durasi"
              >
                25%
              </button>
              <button
                onClick={() => onTimeChange(item.id, item.duration * 0.5)}
                className="px-1.5 py-1 rounded bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-semibold"
                title="Capture di 50% durasi (Midpoint)"
              >
                50%
              </button>
              <button
                onClick={() => onTimeChange(item.id, item.duration * 0.75)}
                className="px-1.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-[10px] font-mono"
                title="Capture di 75% durasi"
              >
                75%
              </button>
            </div>
          </div>
        </div>

        {/* Format Selector & Individual Download Action */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          {/* Format Selection */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
            {(['jpg', 'png', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => onFormatChange(item.id, fmt)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                  item.format === fmt
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Individual Download Button */}
          <button
            onClick={() => onDownloadSingle(item.id)}
            disabled={!item.capturedBlob || item.status !== 'done'}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 hover:text-teal-200 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh</span>
          </button>
        </div>
      </div>
    </div>
  );
};
