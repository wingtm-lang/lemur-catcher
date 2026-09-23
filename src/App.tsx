import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Scissors,
  Download,
  Upload,
  Video as VideoIcon,
  Search,
  Filter,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet,
  Zap,
  Trash2
} from 'lucide-react';
import { VideoItem, AppSettings, Toast, ExportFormat } from './types';
import {
  getBaseFileName,
  loadVideoMetadata,
  extractFrameAtTime,
  downloadBlob,
  cleanupVideoItemUrls,
} from './utils/videoUtils';
import { createZipArchive } from './utils/zipUtils';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { VideoCard } from './components/VideoCard';
import { ProgressBar } from './components/ProgressBar';
import { SettingsModal } from './components/SettingsModal';
import { StandaloneHtmlModal } from './components/StandaloneHtmlModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    defaultFormat: 'jpg',
    defaultQuality: 0.92,
    defaultCaptureTimeRatio: 0.5,
    autoDownloadOnDone: false,
  });

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStandaloneModalOpen, setIsStandaloneModalOpen] = useState(false);

  // Batch progress state
  const [batchProgress, setBatchProgress] = useState({
    isProcessing: false,
    total: 0,
    processed: 0,
    currentName: '',
  });

  // ZIP progress state
  const [isProcessingZip, setIsProcessingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState({
    percent: 0,
    subtitle: '',
  });

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'done' | 'error'>('all');

  // Time change debouncer refs map
  const debounceTimersRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const addToast = useCallback((type: Toast['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      videos.forEach(cleanupVideoItemUrls);
    };
  }, []);

  // Function to extract frame for a specific video item
  const processVideoFrame = async (
    item: VideoItem,
    targetTime?: number,
    format?: ExportFormat,
    quality?: number
  ) => {
    const fmt = format || item.format || settings.defaultFormat;
    const q = quality || item.quality || settings.defaultQuality;

    // Set status to processing
    setVideos((prev) =>
      prev.map((v) => (v.id === item.id ? { ...v, status: 'processing', format: fmt, quality: q } : v))
    );

    try {
      let duration = item.duration;
      let width = item.width;
      let height = item.height;
      let aspectRatio = item.aspectRatio;

      // Load metadata if missing
      if (duration === 0) {
        const meta = await loadVideoMetadata(item.file, item.objectUrl);
        duration = meta.duration;
        width = meta.width;
        height = meta.height;
        aspectRatio = meta.aspectRatio;
      }

      // Calculate time
      const timeToUse =
        targetTime !== undefined
          ? targetTime
          : duration > 0
          ? duration * settings.defaultCaptureTimeRatio
          : 0;

      // Extract frame
      const { blob, previewUrl } = await extractFrameAtTime(
        item.objectUrl,
        timeToUse,
        fmt,
        q
      );

      const outputFilename = `${item.baseName}.${fmt}`;

      setVideos((prev) =>
        prev.map((v) => {
          if (v.id === item.id) {
            // Clean up previous image preview URL if exists
            if (v.capturedImageUrl && v.capturedImageUrl !== previewUrl) {
              try {
                URL.revokeObjectURL(v.capturedImageUrl);
              } catch (e) {
                // ignore
              }
            }
            return {
              ...v,
              duration,
              width,
              height,
              aspectRatio,
              currentTime: timeToUse,
              capturedBlob: blob,
              capturedImageUrl: previewUrl,
              outputFilename,
              format: fmt,
              status: 'done',
              errorMessage: undefined,
            };
          }
          return v;
        })
      );
    } catch (err: any) {
      console.error(`Gagal memproses ${item.name}:`, err);
      setVideos((prev) =>
        prev.map((v) =>
          v.id === item.id
            ? {
                ...v,
                status: 'error',
                errorMessage: err.message || 'Gagal mengekstrak frame video.',
              }
            : v
        )
      );
    }
  };

  // Keep a ref to latest videos for debounced handlers
  const videosRef = useRef(videos);
  useEffect(() => {
    videosRef.current = videos;
  }, [videos]);

  // Process incoming files from upload
  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const newItems: VideoItem[] = [];

    for (const file of files) {
      const { baseName, extension } = getBaseFileName(file.name);
      const objectUrl = URL.createObjectURL(file);
      const defaultFmt = settings.defaultFormat;

      const item: VideoItem = {
        id: Math.random().toString(36).substring(2, 11),
        file,
        name: file.name,
        baseName,
        originalExtension: extension,
        outputFilename: `${baseName}.${defaultFmt}`,
        size: file.size,
        objectUrl,
        duration: 0,
        currentTime: 0,
        status: 'queued',
        capturedImageUrl: null,
        capturedBlob: null,
        width: 1280,
        height: 720,
        aspectRatio: 16 / 9,
        quality: settings.defaultQuality,
        format: defaultFmt,
        mode: 'preview',
      };

      newItems.push(item);
    }

    setVideos((prev) => [...prev, ...newItems]);

    addToast(
      'info',
      `Menambahkan ${newItems.length} video`,
      'Mulai mengekstrak frame tengah otomatis...'
    );

    // Batch process frame extraction
    setBatchProgress({
      isProcessing: true,
      total: newItems.length,
      processed: 0,
      currentName: newItems[0]?.name || '',
    });

    for (let i = 0; i < newItems.length; i++) {
      const currentItem = newItems[i];
      setBatchProgress((prev) => ({
        ...prev,
        processed: i + 1,
        currentName: currentItem.name,
      }));

      await processVideoFrame(currentItem);
    }

    setBatchProgress({
      isProcessing: false,
      total: 0,
      processed: 0,
      currentName: '',
    });

    addToast(
      'success',
      'Ekstraksi Frame Selesai!',
      `${newItems.length} video berhasil diekstrak.`
    );
  };

  // Handle Scrubbing slider time change with debouncer
  const handleTimeChange = (id: string, newTime: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, currentTime: newTime } : v))
    );

    // Clear existing timer if user drags rapidly
    if (debounceTimersRef.current[id]) {
      clearTimeout(debounceTimersRef.current[id]);
    }

    debounceTimersRef.current[id] = setTimeout(() => {
      const item = videosRef.current.find((v) => v.id === id);
      if (item) {
        processVideoFrame({ ...item, currentTime: newTime }, newTime);
      }
    }, 150);
  };

  // Format change per item
  const handleFormatChange = (id: string, format: ExportFormat) => {
    const item = videosRef.current.find((v) => v.id === id);
    if (item) {
      const outputFilename = `${item.baseName}.${format}`;
      setVideos((prev) =>
        prev.map((v) => (v.id === id ? { ...v, format, outputFilename } : v))
      );
      processVideoFrame(item, item.currentTime, format);
    }
  };

  // Rename base filename
  const handleRename = (id: string, newBaseName: string) => {
    setVideos((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          const outputFilename = `${newBaseName}.${v.format}`;
          return { ...v, baseName: newBaseName, outputFilename };
        }
        return v;
      })
    );
  };

  // Download single item
  const handleDownloadSingle = (id: string) => {
    const item = videos.find((v) => v.id === id);
    if (item && item.capturedBlob) {
      downloadBlob(item.capturedBlob, item.outputFilename);
      addToast('success', 'Gambar Berhasil Diunduh', item.outputFilename);
    }
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    const readyItems = videos.filter((v) => v.capturedBlob && v.status === 'done');
    if (readyItems.length === 0) {
      addToast('warning', 'Tidak Ada Frame Siap', 'Silakan tunggu proses ekstraksi frame.');
      return;
    }

    setIsProcessingZip(true);
    setZipProgress({ percent: 0, subtitle: 'Menyiapkan file...' });

    try {
      const zipBlob = await createZipArchive(readyItems, (percent, currentName) => {
        setZipProgress({
          percent,
          subtitle: currentName,
        });
      });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const zipFilename = `Frame_Jahit_Bulk_${timestamp}.zip`;

      downloadBlob(zipBlob, zipFilename);
      addToast(
        'success',
        'Unduh ZIP Berhasil!',
        `${readyItems.length} file gambar dikompresi ke ${zipFilename}`
      );
    } catch (err: any) {
      console.error('Gagal membuat ZIP:', err);
      addToast('error', 'Gagal Mengompres ZIP', err.message || 'Terjadi kesalahan.');
    } finally {
      setIsProcessingZip(false);
    }
  };

  // Reset all frames to 50% midpoint
  const handleResetAllFrames = async () => {
    if (videos.length === 0) return;

    setBatchProgress({
      isProcessing: true,
      total: videos.length,
      processed: 0,
      currentName: 'Proses ulang...',
    });

    for (let i = 0; i < videos.length; i++) {
      const item = videos[i];
      setBatchProgress((prev) => ({
        ...prev,
        processed: i + 1,
        currentName: item.name,
      }));
      const midTime = item.duration > 0 ? item.duration * settings.defaultCaptureTimeRatio : 0;
      await processVideoFrame(item, midTime);
    }

    setBatchProgress({
      isProcessing: false,
      total: 0,
      processed: 0,
      currentName: '',
    });

    addToast('info', 'Reset Frame Selesai', 'Seluruh video dikembalikan ke frame 50%.');
  };

  // Remove individual video item
  const handleRemove = (id: string) => {
    const item = videos.find((v) => v.id === id);
    if (item) {
      cleanupVideoItemUrls(item);
      setVideos((prev) => prev.filter((v) => v.id !== id));
      addToast('info', 'Video Dihapus', item.name);
    }
  };

  // Clear all videos and reset app state to initial
  const handleClearAll = () => {
    const totalCount = videos.length;
    if (totalCount === 0) return;

    if (window.confirm('Hapus semua video dalam antrean?')) {
      // Clear all active debounce timers
      Object.values(debounceTimersRef.current).forEach((timer) => clearTimeout(timer as any));
      debounceTimersRef.current = {};

      // Release Object URLs
      videos.forEach(cleanupVideoItemUrls);

      // Reset state
      setVideos([]);
      setSearchQuery('');
      setFilterStatus('all');
      setBatchProgress({
        isProcessing: false,
        total: 0,
        processed: 0,
        currentName: '',
      });
      setIsProcessingZip(false);
      setZipProgress({ percent: 0, subtitle: '' });

      // Feedback toast
      addToast(
        'success',
        'Semua Video Berhasil Dihapus',
        `${totalCount} video telah dihapus dari antrean.`
      );
    }
  };

  // Filtered list
  const filteredVideos = videos.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.outputFilename.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'done') return matchesSearch && item.status === 'done';
    if (filterStatus === 'error') return matchesSearch && item.status === 'error';
    return matchesSearch;
  });

  const doneCount = videos.filter((v) => v.status === 'done').length;
  const errorCount = videos.filter((v) => v.status === 'error').length;
  const processingCount = videos.filter((v) => v.status === 'processing').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Header Bar */}
      <Header
        totalCount={videos.length}
        doneCount={doneCount}
        processingCount={processingCount}
        errorCount={errorCount}
        isProcessingZip={isProcessingZip}
        exportFormat={settings.defaultFormat}
        onDownloadAllZip={handleDownloadAllZip}
        onResetAllFrames={handleResetAllFrames}
        onClearAll={handleClearAll}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStandaloneModal={() => setIsStandaloneModalOpen(true)}
      />

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col gap-6">
        {/* Bulk Extraction Progress Bar */}
        <ProgressBar
          isVisible={batchProgress.isProcessing}
          progressPercent={
            batchProgress.total > 0
              ? (batchProgress.processed / batchProgress.total) * 100
              : 0
          }
          title={`Lemur Catcher mengekstrak frame video (${batchProgress.processed} dari ${batchProgress.total})...`}
          subtitle={`Sedang memproses: ${batchProgress.currentName}`}
        />

        {/* ZIP Compression Progress Bar */}
        <ProgressBar
          isVisible={isProcessingZip}
          progressPercent={zipProgress.percent}
          title="Menyiapkan File ZIP Massal..."
          subtitle={zipProgress.subtitle}
        />

        {/* Upload Dropzone */}
        {videos.length === 0 ? (
          <UploadZone onFilesSelected={handleFilesSelected} />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Search & Filter Toolbar */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-md">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari nama video atau output..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500/50"
                />
              </div>

              {/* Status Filters & Add More */}
              <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterStatus === 'all'
                        ? 'bg-teal-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Semua ({videos.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('done')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterStatus === 'done'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Siap ({doneCount})
                  </button>
                  {errorCount > 0 && (
                    <button
                      onClick={() => setFilterStatus('error')}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        filterStatus === 'error'
                          ? 'bg-rose-500 text-white font-bold'
                          : 'text-rose-400'
                      }`}
                    >
                      Gagal ({errorCount})
                    </button>
                  )}
                </div>

                {/* Clear All button */}
                <button
                  onClick={handleClearAll}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                  title="Hapus semua video dalam antrean"
                  id="btn-clear-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus Semua</span>
                </button>

                {/* Compact Add More Upload button */}
                <UploadZone onFilesSelected={handleFilesSelected} compact />
              </div>
            </div>

            {/* Video Cards Grid */}
            {filteredVideos.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400">
                <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold">Tidak ada video yang cocok dengan filter.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredVideos.map((item) => (
                  <VideoCard
                    key={item.id}
                    item={item}
                    onTimeChange={handleTimeChange}
                    onDownloadSingle={handleDownloadSingle}
                    onRemove={handleRemove}
                    onFormatChange={handleFormatChange}
                    onRename={handleRename}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Informational Guidance Banner */}
        <div className="mt-auto pt-8 border-t border-slate-800/80">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-400">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Otomatisasi Lemur 50% Midpoint</h4>
                <p className="leading-relaxed">
                  Lemur Catcher langsung mengintai frame di pertengahan durasi video secara instan tanpa perlu menunggu server.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Presisi Detik & Jarum Jahit</h4>
                <p className="leading-relaxed">
                  Gunakan tombol mikro-step <span className="font-mono text-teal-300">±0.2s</span> untuk mengunci posisi gerakan jarum saat menjahit.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-slate-200 mb-1">Preservasi Nama File Synchronous</h4>
                <p className="leading-relaxed">
                  Nama file hasil capture gambar dijamin 100% persis sama dengan nama video asal (contoh: <span className="font-mono text-emerald-300">Jahit_Kerah_01.jpg</span>).
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onSave={(newSettings) => {
          setSettings(newSettings);
          addToast('success', 'Pengaturan Disimpan');
        }}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Standalone Single HTML Export Modal */}
      <StandaloneHtmlModal
        isOpen={isStandaloneModalOpen}
        onClose={() => setIsStandaloneModalOpen(false)}
      />
    </div>
  );
}
