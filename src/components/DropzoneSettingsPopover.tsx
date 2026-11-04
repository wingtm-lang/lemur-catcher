import React, { useEffect, useRef } from 'react';
import {
  SlidersHorizontal,
  Maximize2,
  Layers,
  RotateCcw,
  X,
  Sparkles,
} from 'lucide-react';
import {
  DropzoneDisplaySettings,
  DEFAULT_DROPZONE_SETTINGS,
  DROPZONE_WIDTH_PRESETS,
  DROPZONE_OPACITY_PRESETS,
} from '../utils/dropzoneStorage';

interface DropzoneSettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DropzoneDisplaySettings;
  onUpdateSettings: (settings: DropzoneDisplaySettings) => void;
  align?: 'left' | 'right' | 'center';
}

export const DropzoneSettingsPopover: React.FC<DropzoneSettingsPopoverProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  align = 'right',
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on Escape or click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const opacityPercentage = Math.round(settings.opacity * 100);

  const alignmentClasses =
    align === 'right'
      ? 'right-0 origin-top-right'
      : align === 'left'
      ? 'left-0 origin-top-left'
      : 'left-1/2 -translate-x-1/2 origin-top';

  return (
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={`absolute top-full mt-2.5 z-50 w-84 sm:w-96 max-w-[92vw] bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl p-4 sm:p-5 shadow-2xl text-slate-800 ${alignmentClasses} animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-slate-900/10`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-100/90 text-emerald-800 shadow-sm">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-hand-story font-bold text-sm text-slate-900 leading-tight">
              Dropzone Settings
            </h4>
            <p className="text-[11px] text-slate-500 font-hand-story">
              Atur lebar & transparansi kotak upload
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...DEFAULT_DROPZONE_SETTINGS })}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors"
            title="Kembalikan ke ukuran default (580px, 45%)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Tutup pengaturan"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* 1. Lebar Kotak (Width) */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-hand-story font-bold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
              Lebar Kotak (Width):
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-900 font-mono text-[11px] font-bold">
              {settings.maxWidth} px
            </span>
          </div>

          <input
            type="range"
            min={380}
            max={1050}
            step={10}
            value={settings.maxWidth}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                maxWidth: parseInt(e.target.value, 10),
              })
            }
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-2.5"
          />

          {/* Width Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {DROPZONE_WIDTH_PRESETS.map((preset) => {
              const isActive = Math.abs(settings.maxWidth - preset.width) <= 20;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      maxWidth: preset.width,
                    })
                  }
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-hand-story font-bold border transition-all text-center ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[1.02]'
                      : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {preset.label}
                  <span className="block text-[9px] opacity-80 font-mono">
                    {preset.width}px
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Transparansi Box (Glass Opacity) */}
        <div className="pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between text-xs mb-1.5 font-hand-story font-bold">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Transparansi Kotak (Opacity):
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100/80 text-emerald-900 font-mono text-[11px] font-bold">
              {opacityPercentage}%
            </span>
          </div>

          <input
            type="range"
            min={8}
            max={95}
            step={2}
            value={opacityPercentage}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                opacity: parseInt(e.target.value, 10) / 100,
              })
            }
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 mb-2.5"
          />

          {/* Opacity Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {DROPZONE_OPACITY_PRESETS.map((preset) => {
              const presetPct = Math.round(preset.opacity * 100);
              const isActive = Math.abs(opacityPercentage - presetPct) <= 3;
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() =>
                    onUpdateSettings({
                      ...settings,
                      opacity: preset.opacity,
                    })
                  }
                  className={`py-1.5 px-1 rounded-xl text-[11px] font-hand-story font-bold border transition-all text-center ${
                    isActive
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm scale-[1.02]'
                      : 'bg-white/80 hover:bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  {preset.label}
                  <span className="block text-[9px] opacity-80 font-mono">
                    {presetPct}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Efek Blur Kaca (Backdrop Blur) */}
        <div className="pt-2 border-t border-slate-200/60">
          <div className="flex items-center justify-between text-xs mb-1 font-hand-story font-bold">
            <span className="text-slate-600 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Efek Buram Kaca (Backdrop Blur):
            </span>
            <span className="font-mono text-slate-600 text-[11px]">
              {settings.blur}px
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={36}
            step={2}
            value={settings.blur}
            onChange={(e) =>
              onUpdateSettings({
                ...settings,
                blur: parseInt(e.target.value, 10),
              })
            }
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
          />
        </div>

        {/* Helper Note */}
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-2.5 text-[11px] font-hand-story text-emerald-900 flex items-center justify-between">
          <span>Pengaturan otomatis tersimpan di perangkat.</span>
          <button
            type="button"
            onClick={() => onUpdateSettings({ ...DEFAULT_DROPZONE_SETTINGS })}
            className="underline font-bold hover:text-emerald-950 ml-2 shrink-0"
          >
            Reset Default
          </button>
        </div>
      </div>
    </div>
  );
};
