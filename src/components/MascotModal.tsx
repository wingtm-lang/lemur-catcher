import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Check,
  Trash2,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Clock,
  MessageSquare,
  Smile,
  Camera,
  Type,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  CustomMascot,
  MascotSettings,
  PresetMascot,
  SpeechFont,
  SpeechMovingObject,
  SPEECH_FONT_OPTIONS,
  SPEECH_MOVING_OBJECT_OPTIONS,
  PRESET_MASCOTS,
  DEFAULT_MASCOT_URL,
  saveMascotFromUpload,
  deleteMascotById,
  clearAllMascots,
} from '../utils/mascotStorage';
import { renderSpeechMovingObject } from './LemurMascot';

interface MascotModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'bubble' | 'upload' | 'presets' | 'history';
  activeMascotId: string | null;
  activeMascotUrl: string;
  mascots: CustomMascot[];
  mascotSettings: MascotSettings;
  onSelectDefault: () => void;
  onSelectPreset: (preset: PresetMascot) => void;
  onSelectCustom: (mascot: CustomMascot) => void;
  onMascotsUpdated: () => void;
  onSettingsChange: (settings: MascotSettings) => void;
  onToast: (type: 'success' | 'info' | 'warning' | 'error', title: string, message?: string) => void;
}

export const MascotModal: React.FC<MascotModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'bubble',
  activeMascotId,
  activeMascotUrl,
  mascots,
  mascotSettings,
  onSelectDefault,
  onSelectPreset,
  onSelectCustom,
  onMascotsUpdated,
  onSettingsChange,
  onToast,
}) => {
  const [activeTab, setActiveTab] = useState<'bubble' | 'upload' | 'presets' | 'history'>(initialTab);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingSpeechText, setEditingSpeechText] = useState(mascotSettings.speechText);
  const [tempPreviewUrl, setTempPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    setEditingSpeechText(mascotSettings.speechText);
  }, [mascotSettings.speechText]);

  if (!isOpen) return null;

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    if (!file.type.startsWith('image/')) {
      onToast('error', 'Format File Tidak Didukung', 'Harap pilih file gambar (JPG, PNG, WEBP, GIF).');
      return;
    }

    setIsUploading(true);
    try {
      const saved = await saveMascotFromUpload(file);
      onSelectCustom(saved);
      onMascotsUpdated();
      setTempPreviewUrl(null);
      onToast(
        'success',
        'Foto Karakter Berhasil Diubah!',
        `"${file.name}" telah aktif dan tersimpan di memori perangkat ini.`
      );
    } catch (err: any) {
      console.error('Failed to save mascot:', err);
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
      await deleteMascotById(id);
      onMascotsUpdated();
      setDeleteConfirmId(null);
      onToast('info', 'Foto Dihapus dari Riwayat', `"${name}" telah dihapus.`);
    } catch (err: any) {
      console.error('Failed to delete mascot:', err);
      onToast('error', 'Gagal Menghapus Foto', 'Silakan coba lagi.');
    }
  };

  const handleClearAllHistory = async () => {
    if (window.confirm('Hapus semua riwayat foto maskot yang pernah diunggah?')) {
      try {
        await clearAllMascots();
        onMascotsUpdated();
        onToast('info', 'Riwayat Foto Maskot Dikosongkan');
      } catch (err: any) {
        onToast('error', 'Gagal Mengosongkan Riwayat');
      }
    }
  };

  const handleSpeechTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditingSpeechText(val);
    onSettingsChange({
      ...mascotSettings,
      speechText: val,
    });
  };

  const handleToggleSpeechBubble = () => {
    onSettingsChange({
      ...mascotSettings,
      showSpeechBubble: !mascotSettings.showSpeechBubble,
    });
  };

  const handleQuickPresetSpeech = (text: string) => {
    setEditingSpeechText(text);
    onSettingsChange({
      ...mascotSettings,
      speechText: text,
    });
  };

  const handleFontSelect = (fontId: SpeechFont) => {
    onSettingsChange({
      ...mascotSettings,
      speechFont: fontId,
    });
    const fontName = SPEECH_FONT_OPTIONS.find((f) => f.id === fontId)?.name || fontId;
    onToast('info', 'Font Gelembung Dipilih', `Gaya tulisan diubah ke ${fontName}.`);
  };

  const handleMovingObjectSelect = (objectId: SpeechMovingObject) => {
    onSettingsChange({
      ...mascotSettings,
      movingObject: objectId,
    });
    const objectName = SPEECH_MOVING_OBJECT_OPTIONS.find((o) => o.id === objectId)?.name || objectId;
    onToast('info', 'Objek Bergerak Dipilih', `Animasi diubah ke ${objectName}.`);
  };

  const currentDisplayUrl = tempPreviewUrl || activeMascotUrl || DEFAULT_MASCOT_URL;
  const currentFontClass =
    SPEECH_FONT_OPTIONS.find((f) => f.id === mascotSettings.speechFont)?.fontClass || 'font-handwriting';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-4xl bg-white/95 backdrop-blur-2xl border border-white/80 rounded-3xl shadow-2xl shadow-slate-900/20 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/80 flex items-center justify-between bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              {activeTab === 'bubble' ? (
                <MessageSquare className="w-5 h-5 stroke-[2.2]" />
              ) : (
                <Camera className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold font-handwriting text-slate-800 tracking-wide flex items-center gap-2">
                <span>Kustomisasi Maskot & Gelembung Bicara</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 font-sans font-bold">
                  Interaktif
                </span>
              </h2>
              <p className="text-xs font-hand-story text-slate-600 mt-0.5">
                Sesuaikan font tulisan, objek bergerak animasi, serta gambar foto maskot sesuai seleramu.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onSelectDefault();
                onToast('info', 'Maskot Dikembalikan ke Asli', 'Lemur Hijau diterapkan kembali.');
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-white text-slate-600 hover:text-emerald-700 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
              title="Reset ke gambar maskot bawaan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Maskot</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200/70 bg-white/70 flex gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('bubble')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'bubble'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Gelembung Bicara (Font & Animasi)</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'upload'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Foto Sendiri</span>
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'presets'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Pilihan Bawaan ({PRESET_MASCOTS.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Riwayat Perangkat</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
              {mascots.length}
            </span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: SPEECH BUBBLE FONT & MOVING ANIMATED OBJECTS */}
          {activeTab === 'bubble' && (
            <div className="space-y-6">
              {/* Top Banner: Speech text input & On/Off switch */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-2 font-hand-story text-sm">
                    <MessageSquare className="w-4 h-4 text-emerald-600" />
                    <span>Teks Ucapan Gelembung Bicara</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleSpeechBubble}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                      mascotSettings.showSpeechBubble
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-slate-200 text-slate-600 border-slate-300'
                    }`}
                  >
                    {mascotSettings.showSpeechBubble ? 'Gelembung Aktif' : 'Nonaktif'}
                  </button>
                </div>

                {mascotSettings.showSpeechBubble && (
                  <>
                    <input
                      type="text"
                      value={editingSpeechText}
                      onChange={handleSpeechTextChange}
                      placeholder="Ketik teks gelembung..."
                      maxLength={60}
                      className={`w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-800 focus:outline-none focus:border-emerald-500 ${currentFontClass} text-xl shadow-inner`}
                    />

                    {/* Quick presets */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="text-[11px] font-semibold text-slate-500">Pilihan Cepat:</span>
                      {[
                        'Drop video menjahit di sini!',
                        '✂️ Siap potong & tangkap frame! ✂️',
                        '🧵 Video menjahit kamu di sini ya! 🧵',
                        '👗 Ayo ekstrak frame baju cantikmu! ✨',
                        '🐾 Halo penjahit kreatif! Siap mulai? 🐾',
                      ].map((phrase, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickPresetSpeech(phrase)}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-slate-700 hover:text-emerald-800 transition-colors shadow-2xs"
                        >
                          {phrase}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Main Grid: Left = Font & Objects Picker, Right = Live Interactive Mascot Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                  {/* SECTION A: FONT SELECTION */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Type className="w-4 h-4 text-emerald-600" />
                        <span>Pilihan Gaya Huruf (Font) Gelembung</span>
                      </h4>
                      <span className="text-xs font-hand-story text-slate-500">
                        {SPEECH_FONT_OPTIONS.length} Pilihan Tipografi
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {SPEECH_FONT_OPTIONS.map((f) => {
                        const isSelected = mascotSettings.speechFont === f.id;
                        return (
                          <div
                            key={f.id}
                            onClick={() => handleFontSelect(f.id)}
                            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between bg-white relative group ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <span className="font-bold text-xs text-slate-800 block">
                                  {f.name}
                                </span>
                                <span className="text-[10px] text-slate-500 font-sans">
                                  {f.badge}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                                </div>
                              )}
                            </div>

                            {/* Sample Preview */}
                            <div
                              className={`p-2 rounded-xl bg-slate-50 border border-slate-100 text-emerald-950 text-base md:text-lg font-bold ${f.fontClass} truncate group-hover:text-emerald-700 transition-colors`}
                            >
                              {editingSpeechText || f.sample}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECTION B: SELECTABLE ANIMATED MOVING OBJECTS */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <span>Pilihan Objek Bergerak (Animasi Gelembung)</span>
                      </h4>
                      <span className="text-xs font-hand-story text-slate-500">
                        {SPEECH_MOVING_OBJECT_OPTIONS.length} Objek Animasi
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {SPEECH_MOVING_OBJECT_OPTIONS.map((obj) => {
                        const isSelected = mascotSettings.movingObject === obj.id;
                        return (
                          <div
                            key={obj.id}
                            onClick={() => handleMovingObjectSelect(obj.id)}
                            className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center bg-white relative group ${
                              isSelected
                                ? 'border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50/70'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </div>
                            )}

                            {/* Live animating icon */}
                            <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                              {renderSpeechMovingObject(obj.id, 'left') || (
                                <span className="text-slate-400 text-lg">✕</span>
                              )}
                            </div>

                            <span className="font-bold text-xs text-slate-800 leading-tight">
                              {obj.name}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {obj.description}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Live Mascot & Speech Bubble Preview Stage */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-50/60 to-slate-100 rounded-3xl border border-slate-200 shadow-inner sticky top-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                    <Smile className="w-4 h-4 text-emerald-600" />
                    <span>Preview Gelembung Langsung</span>
                  </span>

                  {/* Mascot Stage with Real Selected Font & Moving Objects */}
                  <div className="relative flex flex-col items-center justify-center py-6 w-full">
                    {/* Live Speech Bubble */}
                    {mascotSettings.showSpeechBubble && (
                      <div
                        className={`relative -top-4 z-20 px-4 py-2 bg-white/95 border border-white text-emerald-950 font-bold ${currentFontClass} text-lg md:text-xl rounded-2xl shadow-xl shadow-slate-900/10 backdrop-blur-2xl whitespace-nowrap flex items-center gap-2 max-w-full overflow-hidden`}
                      >
                        {mascotSettings.movingObject !== 'none' &&
                          renderSpeechMovingObject(mascotSettings.movingObject, 'left')}

                        <span className="truncate max-w-[170px]">
                          {editingSpeechText || 'Drop video di sini!'}
                        </span>

                        {mascotSettings.movingObject !== 'none' &&
                          renderSpeechMovingObject(mascotSettings.movingObject, 'right')}

                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white/95 border-r border-b border-white rotate-45" />
                      </div>
                    )}

                    {/* Mascot Image */}
                    <div className="w-36 h-36 rounded-3xl overflow-hidden border-2 border-white bg-white shadow-xl shadow-slate-900/10 flex items-center justify-center relative">
                      <img
                        src={currentDisplayUrl}
                        alt="Preview Maskot"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/80 border border-slate-200/80 rounded-2xl w-full text-center">
                    <p className="text-[11px] font-bold text-slate-700">
                      Font: <span className="text-emerald-700">{SPEECH_FONT_OPTIONS.find((f) => f.id === mascotSettings.speechFont)?.name}</span>
                    </p>
                    <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                      Objek: <span className="text-emerald-700">{SPEECH_MOVING_OBJECT_OPTIONS.find((o) => o.id === mascotSettings.movingObject)?.name}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                  >
                    <span>Mau ganti foto gambar maskot juga?</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD PHOTO */}
          {activeTab === 'upload' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Upload Drop Area */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e.target.files)}
                />

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
                    if (e.dataTransfer.files) {
                      handleFileUpload(e.dataTransfer.files);
                    }
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`group relative p-8 rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center min-h-[220px] ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01]'
                      : 'border-slate-300 hover:border-emerald-400 bg-slate-50/60 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-md flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    {isUploading ? (
                      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6 text-emerald-600" />
                    )}
                  </div>
                  <h4 className="font-bold text-slate-800 text-base font-handwriting">
                    {isUploading ? 'Sedang Memproses Foto...' : 'Pilih Foto Maskot dari Perangkat'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs font-hand-story">
                    Klik untuk memilih atau seret & lepas file gambar (PNG transparan, JPG, WebP).
                  </p>
                  <span className="mt-3 text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 border border-emerald-200/80 px-3 py-1 rounded-full">
                    Disimpan aman di IndexedDB perangkat Anda
                  </span>
                </div>

                {/* Quick Link to Speech Font Customization */}
                <div
                  onClick={() => setActiveTab('bubble')}
                  className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">
                        Kustomisasi Font & Animasi Objek Gelembung
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Font: {SPEECH_FONT_OPTIONS.find((f) => f.id === mascotSettings.speechFont)?.name} • Objek:{' '}
                        {SPEECH_MOVING_OBJECT_OPTIONS.find((o) => o.id === mascotSettings.movingObject)?.name}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Right Column: Live Mascot Preview */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-emerald-50/50 to-slate-100 rounded-3xl border border-slate-200/80 shadow-inner">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-8 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-emerald-600" />
                  <span>Preview Tampilan di Layar</span>
                </span>

                {/* Mascot with Speech Bubble preview box */}
                <div className="relative flex flex-col items-center justify-center py-4">
                  {/* Floating Speech bubble */}
                  {mascotSettings.showSpeechBubble && (
                    <div
                      className={`relative -top-3 z-20 px-4 py-1.5 bg-white border border-slate-200 text-emerald-950 font-bold ${currentFontClass} text-lg rounded-2xl shadow-lg whitespace-nowrap flex items-center gap-1.5`}
                    >
                      {mascotSettings.movingObject !== 'none' &&
                        renderSpeechMovingObject(mascotSettings.movingObject, 'left')}
                      <span className="max-w-[200px] truncate">{editingSpeechText}</span>
                      {mascotSettings.movingObject !== 'none' &&
                        renderSpeechMovingObject(mascotSettings.movingObject, 'right')}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200 rotate-45" />
                    </div>
                  )}

                  {/* Mascot image */}
                  <div className="w-36 h-36 rounded-3xl overflow-hidden border-2 border-white bg-white shadow-xl shadow-slate-900/10 flex items-center justify-center group relative">
                    <img
                      src={currentDisplayUrl}
                      alt="Preview Maskot"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <p className="text-[11px] font-hand-story text-slate-500 text-center mt-6">
                  Maskot ini akan langsung menggantikan gambar lemur di kotak upload utama aplikasi.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs font-hand-story text-slate-600">
                Pilih dari koleksi gambar karakter bawaan Lemur Catcher atau foto original yang telah disiapkan:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {PRESET_MASCOTS.map((preset) => {
                  const isActive =
                    activeMascotUrl === preset.url ||
                    activeMascotId === preset.id ||
                    (!activeMascotId && preset.id === 'preset_lemur_green');

                  return (
                    <div
                      key={preset.id}
                      onClick={() => onSelectPreset(preset)}
                      className={`relative group p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center bg-white ${
                        isActive
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-3 right-3 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="w-28 h-28 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 mb-3 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                        <img
                          src={preset.url}
                          alt={preset.name}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <h4 className="font-bold text-sm text-slate-800 font-handwriting">
                        {preset.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 font-hand-story leading-relaxed">
                        {preset.description}
                      </p>

                      <button
                        type="button"
                        className={`mt-3 w-full py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                        }`}
                      >
                        {isActive ? 'Sedang Aktif' : 'Terapkan'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 font-handwriting">
                    Koleksi Foto Maskot Tersimpan di Perangkat
                  </h4>
                  <p className="text-xs font-hand-story text-slate-500">
                    Foto yang Anda unggah disimpan secara lokal dan aman di browser ini.
                  </p>
                </div>

                {mascots.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Semua</span>
                  </button>
                )}
              </div>

              {mascots.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/60">
                  <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 font-handwriting">
                    Belum ada foto karakter tersimpan
                  </p>
                  <p className="text-xs text-slate-500 font-hand-story mt-1 max-w-sm mx-auto">
                    Unggah foto baru melalui tab "Unggah Foto Sendiri" untuk mulai mengoleksi foto maskot pilihanmu.
                  </p>
                  <button
                    onClick={() => setActiveTab('upload')}
                    className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition-all"
                  >
                    Mulai Unggah Foto
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {mascots.map((mascot) => {
                    const isActive = activeMascotId === mascot.id;
                    const isConfirmingDelete = deleteConfirmId === mascot.id;

                    return (
                      <div
                        key={mascot.id}
                        className={`group relative p-2.5 rounded-2xl border-2 transition-all flex flex-col items-center bg-white ${
                          isActive
                            ? 'border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
                        }`}
                      >
                        {/* Thumbnail */}
                        <div
                          onClick={() => onSelectCustom(mascot)}
                          className="w-full aspect-square rounded-xl overflow-hidden bg-slate-50 cursor-pointer flex items-center justify-center p-2 mb-2 relative"
                        >
                          <img
                            src={mascot.thumbnailUrl || mascot.dataUrl}
                            alt={mascot.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                          />

                          {isActive && (
                            <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Name and Info */}
                        <div className="w-full px-1">
                          <p
                            className="text-xs font-bold text-slate-800 truncate font-hand-story"
                            title={mascot.name}
                          >
                            {mascot.name}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(mascot.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSelectCustom(mascot)}
                            className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold transition-all ${
                              isActive
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
                            }`}
                          >
                            {isActive ? 'Aktif' : 'Pilih'}
                          </button>

                          {isConfirmingDelete ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(mascot.id, mascot.name)}
                                className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 text-[10px] font-bold"
                                title="Yakin hapus"
                              >
                                Ya
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="p-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 text-[10px]"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(mascot.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus foto dari riwayat"
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
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/90 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs font-hand-story text-slate-500">
            Font:{' '}
            <span className="font-bold text-slate-700">
              {SPEECH_FONT_OPTIONS.find((f) => f.id === mascotSettings.speechFont)?.name}
            </span>{' '}
            • Objek:{' '}
            <span className="font-bold text-slate-700">
              {SPEECH_MOVING_OBJECT_OPTIONS.find((o) => o.id === mascotSettings.movingObject)?.name}
            </span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
