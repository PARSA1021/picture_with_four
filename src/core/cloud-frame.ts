import { LayoutSlot } from '../state/types.ts';

/**
 * Authentic Pure Sky & Fluffy Clouds Frame Engine
 * PIC4U Signature #3: Pure Sky & Fluffy Clouds Edition
 * Designed to match the high-end photographic / artistic aesthetic of
 * Botanical Eucalyptus (#1), Romantic Pink Rose (#2), and Sunshine Yellow (#5).
 */

export const CLOUD_PALETTE = {
  cardBase: '#e0f2fe',
  skyDeep: '#0284c7',
  skyMid: '#38bdf8',
  skyLight: '#bae6fd',
  borderWhite: 'rgba(255, 255, 255, 0.96)'
};

// Singleton background image management
let cloudBgImage: HTMLImageElement | null = null;
let isCloudTextureReady = false;
const textureLoadCallbacks: Array<() => void> = [];

export function onCloudTextureLoaded(callback: () => void) {
  if (isCloudTextureReady) {
    callback();
  } else {
    textureLoadCallbacks.push(callback);
  }
}

export function preloadCloudTexture() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;
  if (cloudBgImage) return;

  cloudBgImage = new Image();
  cloudBgImage.src = '/assets/themes/cloud-frame-bg.jpg';
  cloudBgImage.onload = () => {
    isCloudTextureReady = true;
    textureLoadCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Cloud texture callback error:', err);
      }
    });
  };
  cloudBgImage.onerror = (e) => {
    console.warn('Cloud background texture image failed to load, using procedural fallback.', e);
  };
}

// Auto-preload on file evaluation
preloadCloudTexture();

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draws the real pure blue sky & fluffy clouds card background.
 * Uses the authentic high-resolution photographic sky asset when ready,
 * with a soft summer sky gradient fallback.
 */
export function drawSkyBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.save();

  // If high-resolution real sky & cloud photography asset is ready, draw it with object-fit: cover
  if (cloudBgImage && isCloudTextureReady && cloudBgImage.naturalWidth > 0) {
    const imgW = cloudBgImage.naturalWidth;
    const imgH = cloudBgImage.naturalHeight;
    const imgRatio = imgW / imgH;
    const targetRatio = w / h;

    let sw: number, sh: number, sx: number, sy: number;
    if (targetRatio > imgRatio) {
      sw = imgW;
      sh = imgW / targetRatio;
      sx = 0;
      sy = (imgH - sh) * 0.5;
    } else {
      sh = imgH;
      sw = imgH * targetRatio;
      sx = (imgW - sw) * 0.5;
      sy = (imgH - sh) * 0.5;
    }

    ctx.drawImage(cloudBgImage, sx, sy, sw, sh, x, y, w, h);

    // Soft atmospheric vignette along edges
    const edgeVig = ctx.createLinearGradient(x, y, x + w, y);
    edgeVig.addColorStop(0, 'rgba(15, 60, 110, 0.12)');
    edgeVig.addColorStop(0.08, 'rgba(15, 60, 110, 0)');
    edgeVig.addColorStop(0.92, 'rgba(15, 60, 110, 0)');
    edgeVig.addColorStop(1, 'rgba(15, 60, 110, 0.12)');
    ctx.fillStyle = edgeVig;
    ctx.fillRect(x, y, w, h);

    ctx.restore();
    return;
  }

  // Fallback: Soft azure to summer sky vertical gradient
  drawProceduralSkyFallback(ctx, x, y, w, h, scale);
  ctx.restore();
}

/**
 * Soft sky gradient fallback when asset is loading
 */
function drawProceduralSkyFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.fillStyle = CLOUD_PALETTE.cardBase;
  ctx.fillRect(x, y, w, h);

  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, '#38bdf8');
  grad.addColorStop(0.5, '#7dd3fc');
  grad.addColorStop(1, '#bae6fd');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Soft subtle ambient stipples
  const rand = seededRandom(999);
  const dustCount = Math.min(300, Math.round(w * h * 0.0003));
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < dustCount; i++) {
    const px = x + rand() * w;
    const py = y + rand() * h;
    const pr = (rand() * 2.5 + 1) * scale;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Main foreground decorator for Sky & Clouds Edition:
 * - Renders crisp editorial white paper photo frames with subtle depth shadow (matching Rose, Yellow Rose, & Eucalyptus).
 * - Leaves the authentic sky & fluffy billowing clouds photography seamlessly visible in borders, dividers, and footer.
 */
export function renderCloudDecorations(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  slots: LayoutSlot[],
  scale: number
) {
  if (slots.length === 0) return;

  // 1. DELICATE WHITE PHOTO CARD BORDERS (Clean editorial cutout look matching Rose & Yellow Rose)
  ctx.save();
  ctx.strokeStyle = CLOUD_PALETTE.borderWhite;
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.shadowColor = 'rgba(15, 50, 95, 0.22)';
  ctx.shadowBlur = 5 * scale;
  ctx.shadowOffsetY = 2 * scale;

  slots.forEach((s) => {
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });
  ctx.restore();
}
