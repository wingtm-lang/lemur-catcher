// IndexedDB and storage utility for Lemur Catcher custom wallpapers

export interface CustomWallpaper {
  id: string;
  name: string;
  dataUrl: string;
  thumbnailUrl: string;
  createdAt: number;
  size: number;
  width?: number;
  height?: number;
}

export interface WallpaperDisplaySettings {
  blur: number; // 0 to 16px
  brightness: number; // 50 to 120%
  overlayMode: 'light' | 'dark' | 'none';
  overlayOpacity: number; // 0 to 0.6
}

const DB_NAME = 'LemurCatcherDB';
const DB_VERSION = 1;
const STORE_NAME = 'wallpapers';

const ACTIVE_WALLPAPER_KEY = 'lemur_active_wallpaper_id';
const WALLPAPER_SETTINGS_KEY = 'lemur_wallpaper_settings';

export const DEFAULT_WALLPAPER_SETTINGS: WallpaperDisplaySettings = {
  blur: 0,
  brightness: 100,
  overlayMode: 'light',
  overlayOpacity: 0.1,
};

// Open IndexedDB instance
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung pada browser ini.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helper to downscale image to prevent performance lags and huge memory consumption
async function processImageFile(file: File): Promise<{
  fullDataUrl: string;
  thumbnailDataUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format file gambar tidak valid.'));
      img.onload = () => {
        const origW = img.width;
        const origH = img.height;

        // Max dimension for full wallpaper: 2560px
        const maxDim = 2560;
        let targetW = origW;
        let targetH = origH;

        if (targetW > maxDim || targetH > maxDim) {
          if (targetW > targetH) {
            targetH = Math.round((targetH * maxDim) / targetW);
            targetW = maxDim;
          } else {
            targetW = Math.round((targetW * maxDim) / targetH);
            targetH = maxDim;
          }
        }

        // Full canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal menginisialisasi 2D canvas context.'));
          return;
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);
        const fullDataUrl = canvas.toDataURL('image/jpeg', 0.92);

        // Thumbnail canvas (max 280px width)
        const thumbMax = 280;
        let thumbW = origW;
        let thumbH = origH;
        if (thumbW > thumbMax || thumbH > thumbMax) {
          if (thumbW > thumbH) {
            thumbH = Math.round((thumbH * thumbMax) / thumbW);
            thumbW = thumbMax;
          } else {
            thumbW = Math.round((thumbW * thumbMax) / thumbH);
            thumbH = thumbMax;
          }
        }

        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = thumbW;
        thumbCanvas.height = thumbH;
        const thumbCtx = thumbCanvas.getContext('2d');
        if (thumbCtx) {
          thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
        }
        const thumbnailDataUrl = thumbCanvas.toDataURL('image/jpeg', 0.82);

        resolve({
          fullDataUrl,
          thumbnailDataUrl,
          width: targetW,
          height: targetH,
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// Get all stored wallpapers sorted by newest first
export async function getAllStoredWallpapers(): Promise<CustomWallpaper[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: CustomWallpaper[] = request.result || [];
        list.sort((a, b) => b.createdAt - a.createdAt);
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error fetching wallpapers from IndexedDB:', err);
    return [];
  }
}

// Save a new wallpaper from user File into IndexedDB
export async function saveWallpaperFromUpload(file: File): Promise<CustomWallpaper> {
  const { fullDataUrl, thumbnailDataUrl, width, height } = await processImageFile(file);

  const id = 'wp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  const wallpaper: CustomWallpaper = {
    id,
    name: file.name.replace(/\.[^/.]+$/, ''),
    dataUrl: fullDataUrl,
    thumbnailUrl: thumbnailDataUrl,
    createdAt: Date.now(),
    size: file.size,
    width,
    height,
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(wallpaper);

    request.onsuccess = () => resolve(wallpaper);
    request.onerror = () => reject(request.error);
  });
}

// Get specific wallpaper by ID
export async function getWallpaperById(id: string): Promise<CustomWallpaper | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`Error fetching wallpaper ${id}:`, err);
    return null;
  }
}

// Delete wallpaper by ID
export async function deleteWallpaperById(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      if (getActiveWallpaperId() === id) {
        setActiveWallpaperId(null);
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Clear all wallpapers
export async function clearAllWallpapers(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      setActiveWallpaperId(null);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Active wallpaper ID tracking in localStorage
export function getActiveWallpaperId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_WALLPAPER_KEY);
  } catch {
    return null;
  }
}

export function setActiveWallpaperId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_WALLPAPER_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_WALLPAPER_KEY);
    }
  } catch (err) {
    console.error('Failed to set active wallpaper in localStorage:', err);
  }
}

// Display Settings
export function getStoredWallpaperSettings(): WallpaperDisplaySettings {
  try {
    const data = localStorage.getItem(WALLPAPER_SETTINGS_KEY);
    if (data) {
      return { ...DEFAULT_WALLPAPER_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_WALLPAPER_SETTINGS;
}

export function saveStoredWallpaperSettings(settings: WallpaperDisplaySettings): void {
  try {
    localStorage.setItem(WALLPAPER_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // ignore
  }
}
