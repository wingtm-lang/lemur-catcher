// IndexedDB and storage utility for Lemur Catcher custom Mascot/Character in Dropzone

export interface CustomMascot {
  id: string;
  name: string;
  dataUrl: string;
  thumbnailUrl: string;
  createdAt: number;
  size: number;
  width?: number;
  height?: number;
}

export type SpeechFont =
  | 'caveat'
  | 'patrick'
  | 'kalam'
  | 'comic'
  | 'fredoka'
  | 'pacifico'
  | 'gaegu'
  | 'mono';

export type SpeechMovingObject =
  | 'paws'
  | 'stars'
  | 'butterfly'
  | 'needle'
  | 'hearts'
  | 'music'
  | 'bubbles'
  | 'flower'
  | 'scissors'
  | 'none';

export interface SpeechFontOption {
  id: SpeechFont;
  name: string;
  fontClass: string;
  badge: string;
  sample: string;
}

export interface MovingObjectOption {
  id: SpeechMovingObject;
  name: string;
  icon: string;
  animationClass: string;
  description: string;
}

export const SPEECH_FONT_OPTIONS: SpeechFontOption[] = [
  { id: 'caveat', name: 'Caveat', fontClass: 'font-handwriting', badge: 'Tulisan Tangan Cepat', sample: 'Drop video menjahit di sini!' },
  { id: 'patrick', name: 'Patrick Hand', fontClass: 'font-hand-story', badge: 'Buku Cerita (Storybook)', sample: 'Drop video menjahit di sini!' },
  { id: 'kalam', name: 'Kalam', fontClass: 'font-kalam', badge: 'Kaligrafi Spidol Halus', sample: 'Drop video menjahit di sini!' },
  { id: 'comic', name: 'Comic Neue', fontClass: 'font-comic', badge: 'Komik Ceria & Rapi', sample: 'Drop video menjahit di sini!' },
  { id: 'fredoka', name: 'Fredoka', fontClass: 'font-fredoka', badge: 'Bulat & Gemas (Cute)', sample: 'Drop video menjahit di sini!' },
  { id: 'pacifico', name: 'Pacifico', fontClass: 'font-pacifico', badge: 'Retro Brush Cursive', sample: 'Drop video menjahit di sini!' },
  { id: 'gaegu', name: 'Gaegu', fontClass: 'font-gaegu', badge: 'Coretan Doodle Lucu', sample: 'Drop video menjahit di sini!' },
  { id: 'mono', name: 'Space Mono', fontClass: 'font-mono-cute', badge: 'Mesin Tik Khas Jahit', sample: 'Drop video menjahit di sini!' },
];

export const SPEECH_MOVING_OBJECT_OPTIONS: MovingObjectOption[] = [
  { id: 'paws', name: 'Jejak Kaki Lemur', icon: '🐾', animationClass: 'animate-bounce', description: 'Melompat ceria ke atas bawah' },
  { id: 'stars', name: 'Bintang Berkilau', icon: '✨', animationClass: 'animate-twinkle', description: 'Kelap-kelip berputar anggun' },
  { id: 'butterfly', name: 'Kupu-kupu Menari', icon: '🦋', animationClass: 'animate-flutter', description: 'Mengepak sayap melayang lembut' },
  { id: 'needle', name: 'Jarum & Benang Jahit', icon: '🪡', animationClass: 'animate-swing-music', description: 'Goyangan manis jarum jahitan' },
  { id: 'hearts', name: 'Hati Berdenyut', icon: '💖', animationClass: 'animate-pulse-heart', description: 'Detak cinta berdenyut hangat' },
  { id: 'music', name: 'Not Nada Irama', icon: '🎵', animationClass: 'animate-swing-music', description: 'Berdendang riang di dekat lemur' },
  { id: 'bubbles', name: 'Gelembung Udara', icon: '🫧', animationClass: 'animate-bubble', description: 'Mengapung ringan memantulkan cahaya' },
  { id: 'flower', name: 'Bunga Sakura Mekar', icon: '🌸', animationClass: 'animate-flutter', description: 'Goyangan kelopak bunga mekar' },
  { id: 'scissors', name: 'Gunting Menjahit', icon: '✂️', animationClass: 'animate-scissors', description: 'Gerakan memotong frame kain' },
  { id: 'none', name: 'Tanpa Objek', icon: '💬', animationClass: '', description: 'Teks bersih tanpa animasi objek' },
];

export interface MascotSettings {
  speechText: string;
  showSpeechBubble: boolean;
  speechFont: SpeechFont;
  movingObject: SpeechMovingObject;
  filterEffect?: 'none' | 'vibrant' | 'sepia' | 'vintage';
}

export interface PresetMascot {
  id: string;
  name: string;
  url: string;
  description: string;
}

export const PRESET_MASCOTS: PresetMascot[] = [
  {
    id: 'preset_lemur_green',
    name: 'Lemur Hijau Art (Default)',
    url: '/ab23f2ab5e0fba2456c6e79071b4887c.jpg',
    description: 'Maskot lemur mata besar dengan latar hijau khas Lemur Catcher',
  },
  {
    id: 'preset_lemur_clean',
    name: 'Lemur Pop-Out Clean',
    url: '/lemur.png',
    description: 'Maskot lemur transparan dengan pose ekor melingkar pop-out',
  },
  {
    id: 'preset_lemur_classic',
    name: 'Lemur Favicon Klasik',
    url: '/lemur.jpg',
    description: 'Foto ikonik lemur resolusi asli untuk identitas jahitan',
  },
];

export const DEFAULT_MASCOT_SETTINGS: MascotSettings = {
  speechText: 'Drop video menjahit di sini!',
  showSpeechBubble: true,
  speechFont: 'caveat',
  movingObject: 'paws',
  filterEffect: 'none',
};

export const DEFAULT_MASCOT_URL = '/ab23f2ab5e0fba2456c6e79071b4887c.jpg';

const DB_NAME = 'LemurCatcherDB';
const DB_VERSION = 2;
const STORE_NAME = 'mascots';

const ACTIVE_MASCOT_KEY = 'lemur_active_mascot_id';
const MASCOT_SETTINGS_KEY = 'lemur_mascot_settings';

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
      if (!db.objectStoreNames.contains('wallpapers')) {
        db.createObjectStore('wallpapers', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Downscale mascot image to keep browser snappy while preserving alpha channel transparency
async function processMascotImageFile(file: File): Promise<{
  fullDataUrl: string;
  thumbnailDataUrl: string;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar maskot.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format file gambar tidak valid atau rusak.'));
      img.onload = () => {
        const origW = img.width;
        const origH = img.height;

        // Max dimension for mascot: 1200px (preserves crisp detail on retina screens)
        const maxDim = 1200;
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

        const isPng = file.type === 'image/png' || file.type === 'image/webp';
        const mimeType = isPng ? 'image/png' : 'image/jpeg';
        const quality = isPng ? undefined : 0.92;

        // Full mascot canvas
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal membuat context rendering canvas.'));
          return;
        }

        if (!isPng) {
          // Fill background white for non-transparent JPEGs if needed
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, targetW, targetH);
        }

        ctx.drawImage(img, 0, 0, targetW, targetH);
        const fullDataUrl = canvas.toDataURL(mimeType, quality);

        // Thumbnail canvas (max 240px)
        const thumbMax = 240;
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
          if (!isPng) {
            thumbCtx.fillStyle = '#ffffff';
            thumbCtx.fillRect(0, 0, thumbW, thumbH);
          }
          thumbCtx.drawImage(img, 0, 0, thumbW, thumbH);
        }
        const thumbnailDataUrl = thumbCanvas.toDataURL(mimeType, isPng ? undefined : 0.85);

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

// Get all stored custom mascots
export async function getAllStoredMascots(): Promise<CustomMascot[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: CustomMascot[] = request.result || [];
        list.sort((a, b) => b.createdAt - a.createdAt);
        resolve(list);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('Error fetching mascots from IndexedDB:', err);
    return [];
  }
}

// Save uploaded mascot into IndexedDB
export async function saveMascotFromUpload(file: File): Promise<CustomMascot> {
  const { fullDataUrl, thumbnailDataUrl, width, height } = await processMascotImageFile(file);

  const id = 'mascot_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 7);
  const mascot: CustomMascot = {
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
    const request = store.put(mascot);

    request.onsuccess = () => resolve(mascot);
    request.onerror = () => reject(request.error);
  });
}

// Get specific mascot by ID
export async function getMascotById(id: string): Promise<CustomMascot | null> {
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
    console.error(`Error fetching mascot ${id}:`, err);
    return null;
  }
}

// Delete mascot by ID
export async function deleteMascotById(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      if (getActiveMascotId() === id) {
        setActiveMascotId(null);
      }
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Clear all mascots
export async function clearAllMascots(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      setActiveMascotId(null);
      resolve();
    };
    request.onerror = () => reject(request.error);
  });
}

// Active mascot ID in localStorage
export function getActiveMascotId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_MASCOT_KEY);
  } catch {
    return null;
  }
}

export function setActiveMascotId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(ACTIVE_MASCOT_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_MASCOT_KEY);
    }
  } catch (err) {
    console.error('Failed to set active mascot in localStorage:', err);
  }
}

// Mascot Settings (Speech text, show speech bubble, etc.)
export function getStoredMascotSettings(): MascotSettings {
  try {
    const data = localStorage.getItem(MASCOT_SETTINGS_KEY);
    if (data) {
      return { ...DEFAULT_MASCOT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_MASCOT_SETTINGS;
}

export function saveStoredMascotSettings(settings: MascotSettings): void {
  try {
    localStorage.setItem(MASCOT_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    // ignore
  }
}
