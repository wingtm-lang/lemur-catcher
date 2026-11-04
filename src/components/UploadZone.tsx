import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Sparkles,
  Camera,
  SlidersHorizontal,
} from 'lucide-react';
import { LemurMascot } from './LemurMascot';
import {
  DropzoneDisplaySettings,
  getStoredDropzoneSettings,
  saveStoredDropzoneSettings,
} from '../utils/dropzoneStorage';
import { DropzoneSettingsPopover } from './DropzoneSettingsPopover';
import { SpeechFont, SpeechMovingObject } from '../utils/mascotStorage';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  compact?: boolean;
  mascotUrl?: string;
  speechText?: string;
  showSpeechBubble?: boolean;
  speechFont?: SpeechFont;
  movingObject?: SpeechMovingObject;
  onOpenMascotModal?: () => void;
  settings?: DropzoneDisplaySettings;
  onUpdateSettings?: (newSettings: DropzoneDisplaySettings) => void;
}

export const UploadZone: React.FC<UploadZoneProps> = ({
  onFilesSelected,
  compact = false,
  mascotUrl = '/ab23f2ab5e0fba2456c6e79071b4887c.jpg',
  speechText = 'Drop video menjahit di sini!',
  showSpeechBubble = true,
  speechFont = 'caveat',
  movingObject = 'paws',
  onOpenMascotModal,
  settings: externalSettings,
  onUpdateSettings: externalOnUpdateSettings,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isAdjustPanelOpen, setIsAdjustPanelOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Internal fallback state if not provided via props
  const [internalSettings, setInternalSettings] = useState<DropzoneDisplaySettings>(
    getStoredDropzoneSettings
  );

  const currentSettings = externalSettings || internalSettings;

  const updateSettings = (newSettings: DropzoneDisplaySettings) => {
    if (externalOnUpdateSettings) {
      externalOnUpdateSettings(newSettings);
    } else {
      setInternalSettings(newSettings);
      saveStoredDropzoneSettings(newSettings);
    }
  };

  // State for dragging edge resize
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef<{ startX: number; startWidth: number } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current) return;
      const deltaX = (e.clientX - resizeStartRef.current.startX) * 2; // symmetric resize
      const targetWidth = Math.min(
        Math.max(resizeStartRef.current.startWidth + deltaX, 380),
        1050
      );
      updateSettings({
        ...currentSettings,
        maxWidth: Math.round(targetWidth),
      });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        resizeStartRef.current = null;
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, currentSettings]);

  const handleStartResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartRef.current = {
      startX: e.clientX,
      startWidth: currentSettings.maxWidth,
    };
  };

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
    <div className="w-full flex flex-col items-center justify-center my-auto transition-all duration-300">
      {/* Main Drag & Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          maxWidth: `${currentSettings.maxWidth}px`,
          backgroundColor: isDragOver
            ? `rgba(16, 185, 129, ${Math.min(currentSettings.opacity + 0.35, 0.92)})`
            : `rgba(255, 255, 255, ${currentSettings.opacity})`,
          backdropFilter: `blur(${currentSettings.blur}px)`,
          WebkitBackdropFilter: `blur(${currentSettings.blur}px)`,
          borderColor: isDragOver
            ? 'rgba(16, 185, 129, 0.95)'
            : `rgba(255, 255, 255, ${currentSettings.borderOpacity})`,
        }}
        className={`relative group w-full py-12 sm:py-16 md:py-20 px-5 sm:px-8 md:px-10 min-h-[480px] sm:min-h-[540px] flex flex-col justify-center items-center rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden shadow-2xl mx-auto ${
          isDragOver
            ? 'scale-[1.012] shadow-emerald-500/25 ring-4 ring-emerald-400/40'
            : 'hover:border-emerald-400/90 shadow-slate-900/10'
        } ${isResizing ? 'select-none ring-2 ring-emerald-500' : ''}`}
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

        {/* Tactile Edge Resizers (Left and Right) */}
        <div
          onMouseDown={handleStartResize}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-0 bottom-0 w-3 hover:w-4 group/handle flex items-center justify-center cursor-ew-resize opacity-0 group-hover:opacity-100 transition-all z-20"
          title="Tarik ke kiri/kanan untuk menyesuaikan lebar kotak langsung"
        >
          <div className="w-1.5 h-12 rounded-full bg-emerald-500/70 group-hover/handle:bg-emerald-600 transition-colors shadow-sm" />
        </div>
        <div
          onMouseDown={handleStartResize}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-0 bottom-0 w-3 hover:w-4 group/handle flex items-center justify-center cursor-ew-resize opacity-0 group-hover:opacity-100 transition-all z-20"
          title="Tarik ke kiri/kanan untuk menyesuaikan lebar kotak langsung"
        >
          <div className="w-1.5 h-12 rounded-full bg-emerald-500/70 group-hover/handle:bg-emerald-600 transition-colors shadow-sm" />
        </div>

        {/* Soft Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-300/30 transition-all duration-500" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-300/30 transition-all duration-500" />

        <div className="relative z-10 flex flex-col items-center text-center w-full max-w-xl mx-auto my-auto">
          {/* Animated Lemur Mascot Banner */}
          <div className="mb-5 sm:mb-7 transition-transform duration-300 flex flex-col items-center">
            <LemurMascot
              size="2xl"
              state={isDragOver ? 'celebrate' : 'idle'}
              showSpeechBubble={showSpeechBubble}
              speechText={isDragOver ? 'Lepas video ke sini!' : speechText}
              speechFont={speechFont}
              movingObject={movingObject}
              imageSrc={mascotUrl}
              onEditClick={onOpenMascotModal}
              onCustomizeBubble={onOpenMascotModal}
            />

            {/* Action Buttons: Ganti Karakter & Dropzone Settings side by side */}
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-2 relative z-30">
              {onOpenMascotModal && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMascotModal();
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white text-emerald-900 hover:text-emerald-950 border border-white/90 hover:border-emerald-400 text-xs font-hand-story font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all active:scale-95"
                  title="Ganti gambar karakter / maskot ini dengan foto pilihanmu"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Ganti Karakter</span>
                </button>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAdjustPanelOpen(!isAdjustPanelOpen);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-hand-story font-bold flex items-center gap-1.5 transition-all shadow-sm border active:scale-95 ${
                    isAdjustPanelOpen
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
                      : 'bg-white/80 hover:bg-white text-emerald-900 hover:text-emerald-950 border-white/90 hover:border-emerald-400'
                  }`}
                  title="Atur lebar kotak dan tingkat transparansi kaca"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-current" />
                  <span>Dropzone Settings</span>
                </button>

                <DropzoneSettingsPopover
                  isOpen={isAdjustPanelOpen}
                  onClose={() => setIsAdjustPanelOpen(false)}
                  settings={currentSettings}
                  onUpdateSettings={updateSettings}
                  align="center"
                />
              </div>
            </div>
          </div>

          {/* Title in handwriting font */}
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-handwriting text-slate-800 tracking-wide mb-2 sm:mb-3 leading-snug">
            Tarik & Lepas Video Menjahit ke Lemur Catcher
          </h3>

          {/* Subtitle in casual handwritten storybook font */}
          <p className="text-sm sm:text-base md:text-lg font-hand-story text-slate-700 mb-6 sm:mb-8 max-w-lg leading-relaxed">
            Unggah satu atau banyak video sekaligus (<span className="text-emerald-800 font-bold">Bulk Video Process</span>). Lemur Catcher akan otomatis menangkap frame 50% midpoint paling presisi!
          </p>

          {/* Primary CTA Button */}
          <button
            type="button"
            className="px-7 sm:px-9 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 text-white font-bold font-hand-story text-base sm:text-lg flex items-center gap-2.5 sm:gap-3 shadow-xl shadow-emerald-700/20 group-hover:shadow-emerald-700/35 transition-all mb-6 sm:mb-8 active:scale-95 tracking-wide"
          >
            <Upload className="w-5 h-5 stroke-[2.5]" />
            <span>Pilih File Video</span>
          </button>

          {/* Info Tags / Format Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs text-slate-700 font-hand-story font-semibold">
            <span className="px-3.5 py-1 rounded-full bg-white/60 border border-white/80 shadow-sm">
              MP4, WebM, MOV
            </span>
            <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1.5 text-emerald-800 font-bold shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Auto Midpoint 50%
            </span>
            <span className="px-3.5 py-1 rounded-full bg-white/60 border border-white/80 shadow-sm">
              100% Client-Side Safe
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
