// Storage utility for Lemur Catcher dropzone size & transparency customization

export interface DropzoneDisplaySettings {
  maxWidth: number;     // in pixels (e.g. 580px, range: 380 - 1000)
  opacity: number;      // 0.08 to 0.95 (e.g. 0.45 = 45% white background)
  blur: number;         // 0 to 36 px (backdrop blur, e.g. 20px)
  borderOpacity: number;// 0.1 to 1.0 (border opacity, e.g. 0.7)
}

export const DEFAULT_DROPZONE_SETTINGS: DropzoneDisplaySettings = {
  maxWidth: 580,        // Narrowed by default as requested (persempit)
  opacity: 0.45,        // Aesthetic glassmorphic opacity
  blur: 24,             // Crisp frosted glass
  borderOpacity: 0.75,
};

export const DROPZONE_WIDTH_PRESETS = [
  { label: 'Sempit', width: 460, desc: '460px' },
  { label: 'Sedang', width: 580, desc: '580px (Default)' },
  { label: 'Lebar', width: 760, desc: '760px' },
  { label: 'Luas', width: 960, desc: '960px' },
];

export const DROPZONE_OPACITY_PRESETS = [
  { label: 'Bening', opacity: 0.18, desc: '18%' },
  { label: 'Kaca Estetik', opacity: 0.45, desc: '45% (Default)' },
  { label: 'Pekat', opacity: 0.75, desc: '75%' },
  { label: 'Solid', opacity: 0.95, desc: '95%' },
];

const DROPZONE_STORAGE_KEY = 'lemur_dropzone_display_settings';

export function getStoredDropzoneSettings(): DropzoneDisplaySettings {
  if (typeof window === 'undefined') return { ...DEFAULT_DROPZONE_SETTINGS };
  try {
    const raw = localStorage.getItem(DROPZONE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        maxWidth: typeof parsed.maxWidth === 'number'
          ? Math.min(Math.max(parsed.maxWidth, 360), 1200)
          : DEFAULT_DROPZONE_SETTINGS.maxWidth,
        opacity: typeof parsed.opacity === 'number'
          ? Math.min(Math.max(parsed.opacity, 0.08), 0.98)
          : DEFAULT_DROPZONE_SETTINGS.opacity,
        blur: typeof parsed.blur === 'number'
          ? Math.min(Math.max(parsed.blur, 0), 40)
          : DEFAULT_DROPZONE_SETTINGS.blur,
        borderOpacity: typeof parsed.borderOpacity === 'number'
          ? Math.min(Math.max(parsed.borderOpacity, 0.1), 1)
          : DEFAULT_DROPZONE_SETTINGS.borderOpacity,
      };
    }
  } catch (e) {
    console.warn('Failed to read dropzone settings from localStorage', e);
  }
  return { ...DEFAULT_DROPZONE_SETTINGS };
}

export function saveStoredDropzoneSettings(settings: DropzoneDisplaySettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DROPZONE_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save dropzone settings to localStorage', e);
  }
}
