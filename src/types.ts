export type ExportFormat = 'jpg' | 'png' | 'webp';

export type VideoStatus = 'queued' | 'processing' | 'done' | 'error';

export interface VideoItem {
  id: string;
  file: File;
  name: string;
  baseName: string;
  originalExtension: string;
  outputFilename: string;
  size: number;
  objectUrl: string;
  duration: number;
  currentTime: number;
  status: VideoStatus;
  capturedImageUrl: string | null;
  capturedBlob: Blob | null;
  errorMessage?: string;
  width: number;
  height: number;
  aspectRatio: number;
  quality: number; // 0.1 to 1.0
  format: ExportFormat;
  mode: 'preview' | 'video'; // view mode on card
}

export interface BatchProgress {
  total: number;
  processed: number;
  currentName: string;
  isProcessing: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface AppSettings {
  defaultFormat: ExportFormat;
  defaultQuality: number; // 0.8 to 1.0
  defaultCaptureTimeRatio: number; // 0.5 (50% midpoint)
  autoDownloadOnDone: boolean;
}
