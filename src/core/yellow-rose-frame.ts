import { LayoutSlot } from '../state/types.ts';

/**
 * Authentic Sunshine Yellow Rose & Flowers Garden Frame Engine
 * PIC4U Signature #5: Sunshine Yellow Rose & Garden Flowers Edition
 */

export const YELLOW_ROSE_PALETTE = {
  cardBase: '#fef9c3',
  yellowDeep: '#ca8a04',
  yellowMid: '#eab308',
  yellowLight: '#fde047',
  leafDark: '#365314',
  leafMid: '#4d7c0f',
  leafLight: '#84cc16',
  borderWhite: 'rgba(255, 255, 255, 0.96)'
};

// Singleton background image management
let yellowRoseBgImage: HTMLImageElement | null = null;
let isYellowRoseTextureReady = false;
const textureLoadCallbacks: Array<() => void> = [];

export function onYellowRoseTextureLoaded(callback: () => void) {
  if (isYellowRoseTextureReady) {
    callback();
  } else {
    textureLoadCallbacks.push(callback);
  }
}

export function preloadYellowRoseTexture() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;
  if (yellowRoseBgImage) return;

  yellowRoseBgImage = new Image();
  yellowRoseBgImage.src = '/assets/themes/yellow-rose-frame-bg.jpg';
  yellowRoseBgImage.onload = () => {
    isYellowRoseTextureReady = true;
    textureLoadCallbacks.forEach((cb) => {
      try { cb(); } catch (err) { console.error('Yellow rose texture callback error:', err); }
    });
  };
  yellowRoseBgImage.onerror = (e) => {
    console.warn('Yellow rose background texture image failed to load, using procedural fallback.', e);
  };
}

// Auto-preload on file evaluation
preloadYellowRoseTexture();

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draws the blooming sunshine yellow rose & garden flowers card background.
 * Uses the authentic high-resolution photographic floral asset when ready,
 * with a soft warm golden butter paper fallback.
 */
export function drawYellowRoseBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.save();

  // If high-resolution real yellow flower photography asset is ready, draw it with object-fit: cover
  if (yellowRoseBgImage && isYellowRoseTextureReady && yellowRoseBgImage.naturalWidth > 0) {
    const imgW = yellowRoseBgImage.naturalWidth;
    const imgH = yellowRoseBgImage.naturalHeight;
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

    ctx.drawImage(yellowRoseBgImage, sx, sy, sw, sh, x, y, w, h);

    // Soft warm sunny photographic vignette along edges
    const edgeVig = ctx.createLinearGradient(x, y, x + w, y);
    edgeVig.addColorStop(0, 'rgba(120, 80, 20, 0.12)');
    edgeVig.addColorStop(0.08, 'rgba(120, 80, 20, 0)');
    edgeVig.addColorStop(0.92, 'rgba(120, 80, 20, 0)');
    edgeVig.addColorStop(1, 'rgba(120, 80, 20, 0.12)');
    ctx.fillStyle = edgeVig;
    ctx.fillRect(x, y, w, h);

    ctx.restore();
    return;
  }

  // Fallback: Soft warm butter gradient wash
  drawProceduralYellowRoseFallback(ctx, x, y, w, h, scale);
  ctx.restore();
}

/**
 * Soft warm butter yellow garden fallback when asset is loading
 */
function drawProceduralYellowRoseFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.fillStyle = YELLOW_ROSE_PALETTE.cardBase;
  ctx.fillRect(x, y, w, h);

  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#fefce8');
  grad.addColorStop(0.4, '#fef08a');
  grad.addColorStop(0.75, '#fde047');
  grad.addColorStop(1, '#eab308');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Soft subtle ambient golden pollen dust
  const rand = seededRandom(888);
  const dustCount = Math.min(300, Math.round(w * h * 0.0003));
  ctx.fillStyle = 'rgba(202, 138, 4, 0.06)';
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
 * Main foreground decorator for Yellow Rose Edition:
 * - Renders crisp editorial white paper photo frames with subtle depth shadow.
 * - Leaves the authentic yellow roses & garden flowers photography seamlessly visible in borders, dividers, and footer.
 */
export function renderYellowRoseDecorations(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  slots: LayoutSlot[],
  scale: number
) {
  if (slots.length === 0) return;

  // 1. DELICATE WHITE PHOTO CARD BORDERS (Clean editorial cutout look)
  ctx.save();
  ctx.strokeStyle = YELLOW_ROSE_PALETTE.borderWhite;
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.shadowColor = 'rgba(60, 40, 10, 0.22)';
  ctx.shadowBlur = 5 * scale;
  ctx.shadowOffsetY = 2 * scale;

  slots.forEach((s) => {
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });
  ctx.restore();
}
