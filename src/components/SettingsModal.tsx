import React from 'react';
import { X, Settings as SettingsIcon, Check } from 'lucide-react';
import { AppSettings, ExportFormat } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onSave,
  onClose,
}) => {
  const [localSettings, setLocalSettings] = React.useState<AppSettings>(settings);

  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Pengaturan Lemur Capture</h3>
              <p className="text-xs text-slate-400">Format default & kualitas gambar output</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Format selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Format Ekspor Gambar Default
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['jpg', 'png', 'webp'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setLocalSettings({ ...localSettings, defaultFormat: fmt })}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    localSettings.defaultFormat === fmt
                      ? 'border-teal-400 bg-teal-500/10 text-teal-300 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="uppercase text-sm font-mono">{fmt}</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {fmt === 'jpg' ? 'Ringan / Standard' : fmt === 'png' ? 'Tanpa Kompresi' : 'Modern Web'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quality slider */}
          {localSettings.defaultFormat !== 'png' && (
            <div>
              <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                <span className="font-semibold">Kualitas Kompresi</span>
                <span className="font-mono text-teal-300 font-bold">
                  {Math.round(localSettings.defaultQuality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={1.0}
                step={0.05}
                value={localSettings.defaultQuality}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, defaultQuality: parseFloat(e.target.value) })
                }
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Kualitas 90%+ disarankan untuk detail serat kain & jahitan presisi.
              </p>
            </div>
          )}

          {/* Midpoint capture setting */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Titik Waktu Capture Otomatis
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { ratio: 0.25, label: 'Awal (25%)' },
                { ratio: 0.5, label: 'Tengah (50%)' },
                { ratio: 0.75, label: 'Akhir (75%)' },
              ].map((opt) => (
                <button
                  key={opt.ratio}
                  type="button"
                  onClick={() =>
                    setLocalSettings({ ...localSettings, defaultCaptureTimeRatio: opt.ratio })
                  }
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    localSettings.defaultCaptureTimeRatio === opt.ratio
                      ? 'border-teal-400 bg-teal-500/10 text-teal-300 font-bold'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
          >
            <Check className="w-4 h-4" /> Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};

