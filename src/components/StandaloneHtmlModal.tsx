import React from 'react';
import { X, FileCode2, Download, Check, Sparkles } from 'lucide-react';

interface StandaloneHtmlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StandaloneHtmlModal: React.FC<StandaloneHtmlModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const downloadSingleHtml = () => {
    const htmlCode = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ekstrak Frame Video Jahit - Single File SPA</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- React & ReactDOM CDN -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <!-- Babel CDN for JSX -->
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <!-- JSZip CDN -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
  <!-- Lucide Icons CDN -->
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: system-ui, -apple-system, sans-serif; }
  </style>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useRef } = React;

    function App() {
      const [videos, setVideos] = useState([]);
      const [isProcessingZip, setIsProcessingZip] = useState(false);
      const [progress, setProgress] = useState(0);

      const handleFileUpload = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach(file => {
          const url = URL.createObjectURL(file);
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            file,
            name: file.name,
            baseName,
            outputFilename: \`\${baseName}.jpg\`,
            objectUrl: url,
            duration: 0,
            currentTime: 0,
            status: 'processing',
            capturedImageUrl: null,
            capturedBlob: null
          };

          const vid = document.createElement('video');
          vid.src = url;
          vid.onloadedmetadata = () => {
            const dur = vid.duration || 10;
            const mid = dur * 0.5;
            newItem.duration = dur;
            newItem.currentTime = mid;
            
            // Capture mid frame
            vid.currentTime = mid;
            vid.onseeked = () => {
              const canvas = document.createElement('canvas');
              canvas.width = vid.videoWidth || 1280;
              canvas.height = vid.videoHeight || 720;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(vid, 0, 0, canvas.width, canvas.height);
              canvas.toBlob((blob) => {
                newItem.capturedBlob = blob;
                newItem.capturedImageUrl = URL.createObjectURL(blob);
                newItem.status = 'done';
                setVideos(prev => [...prev.filter(v => v.id !== newItem.id), newItem]);
              }, 'image/jpeg', 0.92);
            };
          };
          vid.onerror = () => {
            newItem.status = 'error';
            setVideos(prev => [...prev.filter(v => v.id !== newItem.id), newItem]);
          };
        });
      };

      const downloadZip = async () => {
        if (!window.JSZip) return alert('Library JSZip belum siap.');
        setIsProcessingZip(true);
        const zip = new JSZip();
        videos.filter(v => v.capturedBlob).forEach(v => {
          zip.file(v.outputFilename, v.capturedBlob);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = \`Frame_Jahit_\${Date.now()}.zip\`;
        a.click();
        setIsProcessingZip(false);
      };

      return (
        <div className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col gap-6">
          <header className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-xl font-bold text-amber-400">Ekstrak Frame Video Jahit</h1>
              <p className="text-xs text-slate-400">Bulk capture frame tengah (50%) & download ZIP</p>
            </div>
            {videos.length > 0 && (
              <button 
                onClick={downloadZip}
                disabled={isProcessingZip}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow"
              >
                {isProcessingZip ? 'Mengompres ZIP...' : 'Unduh Semua (.ZIP)'}
              </button>
            )}
          </header>

          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500 p-8 rounded-2xl text-center bg-slate-900/50 cursor-pointer">
            <input type="file" multiple accept="video/*" onChange={handleFileUpload} className="hidden" id="standalone-input" />
            <label htmlFor="standalone-input" className="cursor-pointer flex flex-col items-center gap-2">
              <span className="text-sm font-semibold text-slate-200">Pilih / Drag & Drop Video di Sini</span>
              <span className="text-xs text-slate-400">Support MP4, WebM, MOV</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.map(v => (
              <div key={v.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="truncate">{v.outputFilename}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">{v.status}</span>
                </div>
                <div className="aspect-video bg-black rounded overflow-hidden flex items-center justify-center">
                  {v.capturedImageUrl ? (
                    <img src={v.capturedImageUrl} className="max-h-full object-contain" />
                  ) : (
                    <span className="text-xs text-slate-500">Memproses...</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-slate-400 font-mono">Durasi: {Math.round(v.duration)}s</span>
                  {v.capturedBlob && (
                    <a 
                      href={v.capturedImageUrl} 
                      download={v.outputFilename}
                      className="text-amber-400 font-bold hover:underline"
                    >
                      Unduh JPG
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    ReactDOM.createRoot(document.getElementById('root')).render(<App />);
  </script>
</body>
</html>`;

    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Ekstrak_Frame_Jahit_Standalone.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Ekspor Single File HTML</h3>
              <p className="text-xs text-slate-400">100% Offline Standalone Lemur Catcher</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            Unduh file <span className="text-teal-300 font-mono font-bold">Lemur_Catcher_Standalone.html</span> yang menggabungkan seluruh aplikasi Lemur Catcher dalam satu file HTML tunggal (CDN + Babel).
          </p>
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" /> Tanpa butuh server / backend node
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" /> Dapat di-double click langsung di Chrome/Edge/Firefox
            </div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Check className="w-3.5 h-3.5" /> Ekstraksi frame canvas + Zip offline
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Batal
          </button>
          <button
            onClick={downloadSingleHtml}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20"
          >
            <Download className="w-4 h-4" /> Unduh .HTML Standalone
          </button>
        </div>
      </div>
    </div>
  );
};
