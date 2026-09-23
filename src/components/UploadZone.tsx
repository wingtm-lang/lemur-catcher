import React, { useRef, useState } from 'react';
import { Upload, Sparkles, Film } from 'lucide-react';
import { LemurMascot } from './LemurMascot';
import mascotImg from '../assets/images/lemur_popout_mascot_1790156325174.jpg';

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
        className={`p-3 sm:px-4 sm:py-2.5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex items-center justify-center gap-2.5 backdrop-blur-xl ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/70 text-emerald-800 scale-[1.01]'
            : 'border-white/60 hover:border-emerald-400/80 bg-white/40 hover:bg-white/60 text-slate-700 shadow-sm'
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
        <Upload className="w-4 h-4 text-emerald-600" />
        <span className="text-sm font-hand-story font-bold">
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
      className={`relative group w-full py-16 sm:py-24 md:py-28 px-6 sm:px-12 md:px-16 min-h-[560px] sm:min-h-[620px] md:min-h-[680px] flex flex-col justify-center items-center rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-2xl shadow-2xl ${
        isDragOver
          ? 'border-emerald-500 bg-emerald-50/70 scale-[1.008] shadow-emerald-500/20'
          : 'border-white/70 hover:border-emerald-400/80 bg-white/45 hover:bg-white/55 shadow-slate-900/5'
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
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-300/25 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-300/35 transition-all duration-500" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-300/25 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-300/35 transition-all duration-500" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full mx-auto my-auto">
        {/* Animated Lemur Mascot Banner */}
        <div className="mb-6 sm:mb-8 transition-transform duration-300 group-hover:scale-105">
          <LemurMascot
            size="2xl"
            state={isDragOver ? 'celebrate' : 'idle'}
            showSpeechBubble
            speechText={isDragOver ? 'Lepas video ke sini! 🐾' : 'Drop video menjahit di sini! 🐾'}
            imageSrc="/ab23f2ab5e0fba2456c6e79071b4887c.jpg"
          />
        </div>

        {/* Title in handwriting font */}
        <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold font-handwriting text-slate-800 tracking-wide mb-3 leading-tight">
          Tarik & Lepas Video Menjahit ke Lemur Catcher
        </h3>

        {/* Subtitle in casual handwritten storybook font */}
        <p className="text-base sm:text-lg md:text-xl font-hand-story text-slate-700 mb-8 sm:mb-10 max-w-2xl leading-relaxed">
          Unggah satu atau banyak video sekaligus (<span className="text-emerald-800 font-bold">Bulk Video Process</span>). Lemur Catcher akan otomatis menangkap frame 50% midpoint paling presisi!
        </p>

        {/* Primary CTA Button */}
        <button
          type="button"
          className="px-8 sm:px-10 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 text-white font-bold font-hand-story text-base sm:text-lg flex items-center gap-3 shadow-xl shadow-emerald-700/20 group-hover:shadow-emerald-700/35 transition-all mb-8 sm:mb-10 active:scale-95 tracking-wide"
        >
          <Upload className="w-5 h-5 stroke-[2.5]" />
          <span>Pilih File Video</span>
        </button>

        {/* Info Tags / Format Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-700 font-hand-story font-semibold">
          <span className="px-4 py-1.5 rounded-full bg-white/60 border border-white/80 shadow-sm">
            Format: MP4, WebM, MOV
          </span>
          <span className="px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1.5 text-emerald-800 font-bold shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" /> Auto Midpoint Frame (50%)
          </span>
          <span className="px-4 py-1.5 rounded-full bg-white/60 border border-white/80 shadow-sm">
            100% Client-Side Safe
          </span>
        </div>
      </div>
    </div>
  );
};

