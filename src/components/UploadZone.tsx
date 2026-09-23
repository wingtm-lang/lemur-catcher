import React, { useRef, useState } from 'react';
import { Upload, Sparkles, Film } from 'lucide-react';
import { LemurMascot } from './LemurMascot';
import mascotImg from '../assets/images/lemur_mascot_1786422171388.jpg';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFilesSelected, compact = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const videoFiles = Array.from(e.dataTransfer.files).filter((file: File) =>
        file.type.startsWith('video/') ||
        /\.(mp4|webm|mov|m4v|mkv|avi|3gp)$/i.test(file.name)
      );
      if (videoFiles.length > 0) {
        onFilesSelected(videoFiles);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      onFilesSelected(filesArray);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (compact) {
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-3 sm:px-4 sm:py-2.5 rounded-xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-2.5 ${
          isDragOver
            ? 'border-teal-400 bg-teal-500/10 text-teal-300 scale-[1.01]'
            : 'border-slate-700/80 hover:border-teal-500/50 bg-slate-900/60 text-slate-300'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/*"
          multiple
          onChange={handleInputChange}
          className="hidden"
        />
        <Upload className="w-4 h-4 text-teal-400" />
        <span className="text-xs font-semibold">
          Tambah Video Lagi (Drag & Drop)
        </span>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative group p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden ${
        isDragOver
          ? 'border-teal-400 bg-teal-500/10 scale-[1.01] shadow-2xl shadow-teal-500/10'
          : 'border-slate-700/80 hover:border-teal-500/50 bg-slate-900/60 hover:bg-slate-900/80'
      }`}
      id="upload-dropzone"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime,video/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Soft Ambient Lighting */}
      <div className="absolute -top-24 -left-24 w-56 h-56 bg-teal-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/20 transition-all duration-500" />
      <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-500" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl mx-auto">
        {/* Animated Lemur Mascot Banner */}
        <div className="mb-4 transition-transform duration-300 group-hover:scale-105">
          <LemurMascot
            size="lg"
            state={isDragOver ? 'celebrate' : 'idle'}
            showSpeechBubble
            speechText={isDragOver ? 'Lepas video ke sini! 🐾' : 'Drop video menjahit di sini! 🐾'}
            imageSrc={mascotImg}
          />
        </div>

        <h3 className="text-lg sm:text-2xl font-bold text-slate-100 tracking-tight mb-2">
          Tarik & Lepas Video Menjahit ke Lemur Catcher
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed">
          Unggah satu atau banyak video sekaligus (<span className="text-teal-300 font-semibold">Bulk Video Process</span>). Lemur Catcher akan otomatis menangkap frame 50% midpoint paling presisi!
        </p>

        {/* Soft Accent CTA Button */}
        <button
          type="button"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-xl shadow-teal-500/20 group-hover:shadow-teal-500/30 transition-all mb-6"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Pilih File Video</span>
        </button>

        {/* Info Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
          <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 font-mono">
            Format: MP4, WebM, MOV
          </span>
          <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 font-mono flex items-center gap-1.5 text-teal-300">
            <Sparkles className="w-3 h-3 text-teal-400" /> Auto Midpoint Frame (50%)
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 font-mono">
            100% Client-Side Safe
          </span>
        </div>
      </div>
    </div>
  );
};

