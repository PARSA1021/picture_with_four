import { ImageData } from '../state/types.ts';
import { MAX_IMAGE_SIZE } from './constants.ts';

/**
 * Loads an image from a source URL/data URL into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = src;
  });
}

/**
 * Compresses an image file if it exceeds maxSize, returning a clean JPEG Data URL
 */
export async function compressImage(
  file: File,
  maxSize: number = MAX_IMAGE_SIZE
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('선택한 파일이 올바른 이미지 형식이 아닙니다.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) {
        reject(new Error('이미지 데이터를 읽을 수 없습니다.'));
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('이미지 디코딩에 실패했습니다.'));
      img.onload = () => {
        let { width: w, height: h } = img;

        if (w > maxSize || h > maxSize) {
          if (w > h) {
            h = Math.round(h * (maxSize / w));
            w = maxSize;
          } else {
            w = Math.round(w * (maxSize / h));
            h = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a fully initialized ImageData object from a File
 */
export async function processImageFile(
  file: File,
  defaultFilter: string | null = null
): Promise<ImageData> {
  const compressedSrc = await compressImage(file);
  const imageElement = await loadImage(compressedSrc);

  return {
    id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    image: imageElement,
    src: compressedSrc,
    flipped: false,
    rotation: 0,
    filter: defaultFilter,
    zoom: 100,
    offsetX: 0,
    offsetY: 0
  };
}
