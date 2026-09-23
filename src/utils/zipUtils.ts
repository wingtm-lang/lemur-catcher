import JSZip from 'jszip';
import { VideoItem } from '../types';

/**
 * Creates a ZIP file containing all captured frame images with original video filenames
 */
export async function createZipArchive(
  items: VideoItem[],
  onProgress?: (progressPercent: number, currentName: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  const validItems = items.filter((item) => item.capturedBlob && item.status === 'done');

  if (validItems.length === 0) {
    throw new Error('Tidak ada frame gambar yang siap diunduh dalam bentuk ZIP.');
  }

  // Add files to zip
  for (let i = 0; i < validItems.length; i++) {
    const item = validItems[i];
    if (item.capturedBlob) {
      zip.file(item.outputFilename, item.capturedBlob);
      if (onProgress) {
        onProgress(Math.round(((i + 1) / validItems.length) * 40), item.outputFilename);
      }
    }
  }

  // Generate zip file with compression
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6,
      },
    },
    (metadata) => {
      if (onProgress) {
        const percent = 40 + Math.round((metadata.percent / 100) * 60);
        onProgress(percent, `Mengompres file ZIP (${Math.round(metadata.percent)}%)...`);
      }
    }
  );

  return zipBlob;
}
