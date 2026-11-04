import React, { useState, useRef } from 'react';
import {
  Camera,
  X,
  Upload,
  Check,
  Trash2,
  RotateCcw,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  CustomWallpaper,
  WallpaperDisplaySettings,
  saveWallpaperFromUpload,
  deleteWallpaperById,
  clearAllWallpapers,
} from '../utils/wallpaperStorage';
import bgDefaultNature from '../assets/images/green_meadow_lake_bg_1790154956627.jpg';
import bgCozyForest from '../assets/images/cozy_forest_lake_bg_1790154771272.jpg';

interface BackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeWallpaperId: string | null;
  activeWallpaperUrl: string | null;
  wallpapers: CustomWallpaper[];
  displaySettings: WallpaperDisplaySettings;
  onSelectDefault: (bgUrl: string, id: string | null) => void;
  onSelectCustom: (wallpaper: CustomWallpaper) => void;
  onWallpapersUpdated: () => void;
  onSettingsChange: (settings: WallpaperDisplaySettings) => void;
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => void;
}

export const BackgroundModal: React.FC<BackgroundModalProps> = ({
  isOpen,
  onClose,
  activeWallpaperId,
  activeWallpaperUrl,
  wallpapers,
  displaySettings,
  onSelectDefault,
  onSelectCustom,
  onWallpapersUpdated,
  onSettingsChange,
  onToast,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate type
    if (!file.type.startsWith('image/')) {
      onToast('error', 'Format File Tidak Didukung', 'Harap pilih file gambar (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    try {
      const saved = await saveWallpaperFromUpload(file);
      onSelectCustom(saved);
      onWallpapersUpdated();
      onToast(
        'success',
        'Background Baru Berhasil Diterapkan!',
        `"${file.name}" telah disimpan di riwayat perangkat ini.`
      );
    } catch (err: any) {
      console.error('Failed to save custom wallpaper:', err);
      onToast('error', 'Gagal Mengunggah Foto', err.message || 'Terjadi kesalahan.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteWallpaperById(id);
      onWallpapersUpdated();
      setDeleteConfirmId(null);
      onToast('info', 'Foto Dihapus dari Riwayat', `"${name}" telah dihapus.`);
    } catch (err: any) {
      console.error('Failed to delete wallpaper:', err);
      onToast('error', 'Gagal Menghapus Foto', err.message || 'Terjadi kesalahan.');
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Hapus seluruh riwayat foto background dari perangkat ini?')) {
      try {
        await clearAllWallpapers();
        onSelectDefault(bgDefaultNature, null);
        onWallpapersUpdated();
        onToast('info', 'Riwayat Dikosongkan', 'Semua foto kustom telah dibersihkan.');
      } catch (err: any) {
        console.error('Failed to clear history:', err);
        onToast('error', 'Gagal Mengosongkan Riwayat', err.message);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    const diffHours = (Date.now() - timestamp) / (1000 * 60 * 60);
    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${Math.floor(diffHours)} jam lalu`;
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const isDefaultActive = !activeWallpaperId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white/95 border border-white/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl shadow-slate-950/40 text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-50/80 via-teal-50/80 to-white border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Camera className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
                Ubah Background Aplikasi
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Riwayat Device
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Pilih atau unggah foto Anda sendiri. Tersimpan lokal di perangkat ini (IndexedDB).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Upload New Wallpaper */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-600" /> Upload Foto Baru
              </span>
              <span className="text-[11px] text-slate-500">
                Mendukung JPG, PNG, WEBP (Max 20MB)
              </span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFileUpload(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 sm:p-7 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2.5 text-center group ${
                isDragOver
                  ? 'border-emerald-500 bg-emerald-50 scale-[1.01]'
                  : 'border-slate-200 hover:border-emerald-500/80 bg-slate-50/70 hover:bg-emerald-50/30'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
              />

              <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-slate-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                {isUploading ? (
                  <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 stroke-[2]" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-800">
                  {isUploading ? 'Sedang memproses & mengompresi gambar...' : 'Klik atau Tarik Foto ke Sini'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-hand-story">
                  Foto akan langsung diterapkan sebagai background dan disimpan ke riwayat perangkat Anda.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Presets & Default */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Wallpaper Bawaan (Default)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Default Meadow */}
              <button
                type="button"
                onClick={() => onSelectDefault(bgDefaultNature, null)}
                className={`relative rounded-2xl overflow-hidden border-2 text-left group transition-all p-1.5 ${
                  isDefaultActive && activeWallpaperUrl === bgDefaultNature
                    ? 'border-emerald-500 shadow-md shadow-emerald-500/20 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-emerald-400 bg-white'
                }`}
              >
                <div className="h-20 rounded-xl overflow-hidden relative">
                  <img
                    src={bgDefaultNature}
                    alt="Padang Rumput Alami"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {isDefaultActive && activeWallpaperUrl === bgDefaultNature && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="p-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Padang Rumput</p>
                    <p className="text-[10px] text-slate-500">Default Alami</p>
                  </div>
                  {isDefaultActive && activeWallpaperUrl === bgDefaultNature && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>
              </button>

              {/* Cozy Forest Preset */}
              <button
                type="button"
                onClick={() => onSelectDefault(bgCozyForest, 'preset_forest')}
                className={`relative rounded-2xl overflow-hidden border-2 text-left group transition-all p-1.5 ${
                  activeWallpaperUrl === bgCozyForest
                    ? 'border-emerald-500 shadow-md shadow-emerald-500/20 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-emerald-400 bg-white'
                }`}
              >
                <div className="h-20 rounded-xl overflow-hidden relative">
                  <img
                    src={bgCozyForest}
                    alt="Danau & Hutan Hijau"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {activeWallpaperUrl === bgCozyForest && (
                    <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="p-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Hutan & Danau</p>
                    <p className="text-[10px] text-slate-500">Nuansa Sejuk</p>
                  </div>
                  {activeWallpaperUrl === bgCozyForest && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                      Aktif
                    </span>
                  )}
                </div>
              </button>

              {/* Reset to Clean / Solid Option */}
              <button
                type="button"
                onClick={() => {
                  onSelectDefault(bgDefaultNature, null);
                  onSettingsChange({
                    ...displaySettings,
                    blur: 0,
                    brightness: 100,
                  });
                }}
                className="rounded-2xl border-2 border-slate-200 hover:border-emerald-400 bg-white hover:bg-slate-50 transition-all p-3 flex flex-col justify-center items-center text-center gap-1.5 group"
              >
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 group-hover:text-emerald-700 group-hover:bg-emerald-50 transition-colors">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Reset ke Asal</p>
                  <p className="text-[10px] text-slate-500">Kembalikan preset awal</p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Device History Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" /> Riwayat Foto di Perangkat Ini ({wallpapers.length})
              </span>
              {wallpapers.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Bersihkan Riwayat
                </button>
              )}
            </div>

            {wallpapers.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100/70 text-emerald-700 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 stroke-[1.8]" />
                </div>
                <p className="text-xs font-bold text-slate-700">Belum Ada Foto dalam Riwayat</p>
                <p className="text-[11px] text-slate-500 max-w-sm font-hand-story">
                  Unggah foto dari tombol di atas. Semua background yang Anda unggah akan otomatis tersimpan di riwayat perangkat ini sehingga dapat Anda ganti kapan saja tanpa perlu upload ulang!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {wallpapers.map((wp) => {
                  const isActive = activeWallpaperId === wp.id;
                  const isConfirmingDelete = deleteConfirmId === wp.id;

                  return (
                    <div
                      key={wp.id}
                      className={`relative rounded-2xl overflow-hidden border-2 transition-all p-1.5 flex flex-col justify-between ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/60 shadow-md shadow-emerald-500/15'
                          : 'border-slate-200 bg-white hover:border-emerald-400'
                      }`}
                    >
                      {/* Image Thumbnail Container */}
                      <div
                        onClick={() => onSelectCustom(wp)}
                        className="h-28 rounded-xl overflow-hidden relative cursor-pointer group"
                      >
                        <img
                          src={wp.thumbnailUrl || wp.dataUrl}
                          alt={wp.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />

                        {/* Active check badge */}
                        {isActive && (
                          <div className="absolute top-2 left-2 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        )}

                        {/* Hover Overlay preview prompt */}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1 backdrop-blur-[2px]">
                          <Eye className="w-3.5 h-3.5" />
                          <span>Terapkan</span>
                        </div>
                      </div>

                      {/* Footer & Meta */}
                      <div className="p-2 pt-2.5 flex items-center justify-between gap-1">
                        <div className="overflow-hidden min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 truncate" title={wp.name}>
                            {wp.name}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <span>{formatDate(wp.createdAt)}</span>
                            <span>•</span>
                            <span>{formatFileSize(wp.size)}</span>
                          </p>
                        </div>

                        {/* Delete Action with confirm */}
                        {isConfirmingDelete ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(wp.id, wp.name)}
                              className="px-2 py-1 rounded bg-rose-600 text-white text-[10px] font-bold shadow hover:bg-rose-700"
                              title="Konfirmasi hapus"
                            >
                              Ya
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-1.5 py-1 rounded bg-slate-200 text-slate-700 text-[10px] hover:bg-slate-300"
                              title="Batal"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(wp.id);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Hapus dari riwayat device"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 4: Display Fine-Tuning (Blur, Brightness, Scrim) */}
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/60">
            <button
              type="button"
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="w-full flex items-center justify-between text-xs font-bold text-slate-700"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Penyesuaian Efek & Keterbacaan Tulisan</span>
              </span>
              <span className="text-[11px] text-emerald-700 font-semibold underline">
                {showSettingsDrawer ? 'Sembunyikan' : 'Sesuaikan Blur & Kecerahan'}
              </span>
            </button>

            {showSettingsDrawer && (
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-4">
                {/* Blur Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                    <span className="font-semibold">Efek Blur Latar Belakang:</span>
                    <span className="font-mono text-emerald-700 font-bold">{displaySettings.blur}px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={12}
                    step={1}
                    value={displaySettings.blur}
                    onChange={(e) =>
                      onSettingsChange({
                        ...displaySettings,
                        blur: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tingkatkan blur bila foto terlalu ramai agar teks dan tombol tetap jelas dibaca.
                  </p>
                </div>

                {/* Brightness Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-700 mb-1">
                    <span className="font-semibold">Kecerahan Background:</span>
                    <span className="font-mono text-emerald-700 font-bold">{displaySettings.brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={50}
                    max={120}
                    step={5}
                    value={displaySettings.brightness}
                    onChange={(e) =>
                      onSettingsChange({
                        ...displaySettings,
                        brightness: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                {/* Overlay Veil */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Lapisan Pelindung Kontras Teks
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { mode: 'light', label: 'Cerah Halus' },
                      { mode: 'dark', label: 'Gelap Lembut' },
                      { mode: 'none', label: 'Tanpa Lapisan' },
                    ].map((m) => (
                      <button
                        key={m.mode}
                        type="button"
                        onClick={() =>
                          onSettingsChange({
                            ...displaySettings,
                            overlayMode: m.mode as any,
                          })
                        }
                        className={`py-1.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                          displaySettings.overlayMode === m.mode
                            ? 'bg-emerald-600 text-white border-emerald-600 font-bold shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-hand-story">
            🐾 Foto disimpan di browser lokal (tidak diunggah ke server luar).
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
