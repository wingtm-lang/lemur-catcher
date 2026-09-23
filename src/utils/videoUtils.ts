import { ExportFormat, VideoItem } from '../types';

/**
 * Extracts base filename without extension
 */
export function getBaseFileName(fileName: string): { baseName: string; extension: string } {
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return { baseName: fileName, extension: '' };
  }
  const baseName = fileName.substring(0, lastDotIndex);
  const extension = fileName.substring(lastDotIndex + 1);
  return { baseName, extension };
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format seconds to mm:ss.ms or ss.s
 */
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  const minsStr = mins < 10 ? `0${mins}` : `${mins}`;
  const secsStr = secs < 10 ? `0${secs}` : `${secs}`;
  return `${minsStr}:${secsStr}.${ms}`;
}

/**
 * Helper to get MIME type from export format
 */
export function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'jpg':
    default:
      return 'image/jpeg';
  }
}

/**
 * Extracts video metadata (duration, width, height)
 */
export function loadVideoMetadata(file: File, objectUrl: string): Promise<{
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    let cleanedUp = false;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout saat membaca metadata video. File mungkin terproteksi atau rusak.'));
    }, 10000);

    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      clearTimeout(timeout);
      video.removeEventListener('loadedmetadata', onMetadata);
      video.removeEventListener('error', onError);
      video.pause();
      video.removeAttribute('src');
      video.load();
    }

    function onMetadata() {
      if (cleanedUp) return;
      const duration = video.duration || 0;
      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const aspectRatio = height > 0 ? width / height : 16 / 9;
      cleanup();
      resolve({ duration, width, height, aspectRatio });
    }

    function onError() {
      if (cleanedUp) return;
      cleanup();
      reject(new Error('Format video tidak didukung atau file gagal dimuat oleh browser.'));
    }

    video.addEventListener('loadedmetadata', onMetadata);
    video.addEventListener('error', onError);
    video.src = objectUrl;

    if (video.readyState >= 1) {
      onMetadata();
    }
  });
}

/**
 * Extracts a frame from a video at specific timestamp and converts to blob/URL
 */
export function extractFrameAtTime(
  videoSourceUrl: string,
  targetTime: number,
  format: ExportFormat = 'jpg',
  quality: number = 0.92
): Promise<{ blob: Blob; previewUrl: string }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    
    // Only set crossOrigin for remote HTTP/HTTPS URLs, not blob: URLs
    if (videoSourceUrl.startsWith('http://') || videoSourceUrl.startsWith('https://')) {
      video.crossOrigin = 'anonymous';
    }
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    let isCleanedUp = false;

    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout saat mengambil frame video.'));
    }, 15000);

    function cleanup() {
      if (isCleanedUp) return;
      isCleanedUp = true;
      clearTimeout(timeout);
      video.removeEventListener('seeked', onSeeked);
      video.removeEventListener('error', onError);
      video.removeEventListener('loadedmetadata', onMetadata);
      video.pause();
      video.removeAttribute('src');
      video.load();
    }

    function onSeeked() {
      if (isCleanedUp) return;
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          reject(new Error('Gagal menginisialisasi Canvas 2D.'));
          return;
        }

        // Draw image frame onto canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const mimeType = getMimeType(format);
        canvas.toBlob(
          (blob) => {
            if (isCleanedUp) return;
            cleanup();
            if (blob) {
              const previewUrl = URL.createObjectURL(blob);
              resolve({ blob, previewUrl });
            } else {
              reject(new Error('Gagal mengonversi frame canvas ke gambar.'));
            }
          },
          mimeType,
          quality
        );
      } catch (err) {
        cleanup();
        reject(err);
      }
    }

    function onError() {
      cleanup();
      reject(new Error('Gagal memuat video untuk pengambilan frame.'));
    }

    function seekAndExtract() {
      const duration = video.duration || 0;
      const boundedTime = Math.max(0, Math.min(targetTime, duration));

      if (Math.abs(video.currentTime - boundedTime) < 0.01) {
        if (video.readyState >= 2) {
          onSeeked();
        } else {
          video.currentTime = boundedTime;
          // Fallback if seeked doesn't trigger when time didn't change
          setTimeout(() => {
            if (!isCleanedUp) onSeeked();
          }, 300);
        }
      } else {
        video.currentTime = boundedTime;
      }
    }

    function onMetadata() {
      seekAndExtract();
    }

    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);
    video.addEventListener('loadedmetadata', onMetadata);

    video.src = videoSourceUrl;

    if (video.readyState >= 1) {
      seekAndExtract();
    }
  });
}

/**
 * Downloads a single captured frame blob directly with target filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Revokes memory URLs for a video item
 */
export function cleanupVideoItemUrls(item: VideoItem): void {
  if (item.objectUrl) {
    try {
      URL.revokeObjectURL(item.objectUrl);
    } catch (e) {
      // ignore
    }
  }
  if (item.capturedImageUrl) {
    try {
      URL.revokeObjectURL(item.capturedImageUrl);
    } catch (e) {
      // ignore
    }
  }
}
