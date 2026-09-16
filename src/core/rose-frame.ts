import { LayoutSlot } from '../state/types.ts';

/**
 * Authentic Romantic Pink Rose Garden Frame Engine
 * PIC4U Signature #2: Romantic Pink Rose Garden Edition
 */

export const ROSE_PALETTE = {
  cardBase: '#fcebee',
  roseDeep: '#be185d',
  roseMid: '#db2777',
  roseLight: '#f472b6',
  leafDark: '#365314',
  leafMid: '#4d7c0f',
  leafLight: '#84cc16',
  borderWhite: 'rgba(255, 255, 255, 0.95)'
};

// Singleton background image management
let roseBgImage: HTMLImageElement | null = null;
let isRoseTextureReady = false;
const textureLoadCallbacks: Array<() => void> = [];

export function onRoseTextureLoaded(callback: () => void) {
  if (isRoseTextureReady) {
    callback();
  } else {
    textureLoadCallbacks.push(callback);
  }
}

export function preloadRoseTexture() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;
  if (roseBgImage) return;

  roseBgImage = new Image();
  roseBgImage.src = '/assets/themes/rose-frame-bg.jpg';
  roseBgImage.onload = () => {
    isRoseTextureReady = true;
    textureLoadCallbacks.forEach((cb) => {
      try { cb(); } catch (err) { console.error('Rose texture callback error:', err); }
    });
  };
  roseBgImage.onerror = (e) => {
    console.warn('Rose background texture image failed to load, using procedural fallback.', e);
  };
}

// Auto-preload on file evaluation
preloadRoseTexture();

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draws the real blooming romantic pink rose garden card background.
 * Uses the authentic high-resolution photographic rose garden asset when ready,
 * with a soft romantic blush paper fallback.
 */
export function drawRoseBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.save();

  // If high-resolution real rose photography asset is ready, draw it with object-fit: cover
  if (roseBgImage && isRoseTextureReady && roseBgImage.naturalWidth > 0) {
    const imgW = roseBgImage.naturalWidth;
    const imgH = roseBgImage.naturalHeight;
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

    ctx.drawImage(roseBgImage, sx, sy, sw, sh, x, y, w, h);

    // Soft romantic photographic vignette along edges
    const edgeVig = ctx.createLinearGradient(x, y, x + w, y);
    edgeVig.addColorStop(0, 'rgba(80, 20, 40, 0.12)');
    edgeVig.addColorStop(0.08, 'rgba(80, 20, 40, 0)');
    edgeVig.addColorStop(0.92, 'rgba(80, 20, 40, 0)');
    edgeVig.addColorStop(1, 'rgba(80, 20, 40, 0.12)');
    ctx.fillStyle = edgeVig;
    ctx.fillRect(x, y, w, h);

    ctx.restore();
    return;
  }

  // Fallback: Soft romantic blush gradient wash
  drawProceduralRoseFallback(ctx, x, y, w, h, scale);
  ctx.restore();
}

/**
 * Soft romantic blush garden fallback when asset is loading
 */
function drawProceduralRoseFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.fillStyle = ROSE_PALETTE.cardBase;
  ctx.fillRect(x, y, w, h);

  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#fff0f3');
  grad.addColorStop(0.4, '#fce7eb');
  grad.addColorStop(0.75, '#fad2db');
  grad.addColorStop(1, '#f7b2c0');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Soft subtle ambient floral dust
  const rand = seededRandom(777);
  const dustCount = Math.min(300, Math.round(w * h * 0.0003));
  ctx.fillStyle = 'rgba(219, 39, 119, 0.04)';
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
 * Main foreground decorator for Rose Edition:
 * - Renders crisp editorial white paper photo frames with subtle depth shadow.
 * - Leaves the authentic real rose photography seamlessly visible in borders, dividers, and footer.
 */
export function renderRoseDecorations(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  slots: LayoutSlot[],
  scale: number
) {
  if (slots.length === 0) return;

  // 1. DELICATE WHITE PHOTO CARD BORDERS (Clean editorial cutout look)
  ctx.save();
  ctx.strokeStyle = ROSE_PALETTE.borderWhite;
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.shadowColor = 'rgba(60, 15, 30, 0.22)';
  ctx.shadowBlur = 5 * scale;
  ctx.shadowOffsetY = 2 * scale;

  slots.forEach((s) => {
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });
  ctx.restore();
}
