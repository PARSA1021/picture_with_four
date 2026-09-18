import { LayoutSlot } from '../state/types.ts';

/**
 * Authentic Watercolor Eucalyptus Garden Frame Engine
 * PIC4U Signature #1: Watercolor Eucalyptus Botanical Edition
 * Designed to match the high-end photographic / artistic aesthetic of
 * Romantic Pink Rose (Signature #2) and Sunshine Yellow Rose (Signature #5).
 */

export const BOTANICAL_PALETTE = {
  cardBase: '#f4f7f2',
  sageDark: '#2d4529',
  sageMid: '#536d4e',
  sageLight: '#7c9b77',
  leafFresh: '#9dbb7d',
  paperCream: '#fbfbf7',
  borderWhite: 'rgba(255, 255, 255, 0.96)'
};

// Singleton background image management
let botanicalBgImage: HTMLImageElement | null = null;
let isBotanicalTextureReady = false;
const textureLoadCallbacks: Array<() => void> = [];

export function onBotanicalTextureLoaded(callback: () => void) {
  if (isBotanicalTextureReady) {
    callback();
  } else {
    textureLoadCallbacks.push(callback);
  }
}

export function preloadBotanicalTexture() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;
  if (botanicalBgImage) return;

  botanicalBgImage = new Image();
  botanicalBgImage.src = '/assets/themes/botanical-frame-bg.jpg';
  botanicalBgImage.onload = () => {
    isBotanicalTextureReady = true;
    textureLoadCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Botanical texture callback error:', err);
      }
    });
  };
  botanicalBgImage.onerror = (e) => {
    console.warn('Botanical background texture image failed to load, using procedural fallback.', e);
  };
}

// Auto-preload on file evaluation
preloadBotanicalTexture();

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draws the authentic watercolor eucalyptus card background.
 * Uses the authentic high-resolution botanical watercolor asset when ready,
 * with an organic watercolor paper wash fallback.
 */
export function drawWatercolorPaperTexture(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.save();

  // If high-resolution real botanical eucalyptus asset is ready, draw it with object-fit: cover
  if (botanicalBgImage && isBotanicalTextureReady && botanicalBgImage.naturalWidth > 0) {
    const imgW = botanicalBgImage.naturalWidth;
    const imgH = botanicalBgImage.naturalHeight;
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

    ctx.drawImage(botanicalBgImage, sx, sy, sw, sh, x, y, w, h);

    // Soft organic botanical vignette along edges
    const edgeVig = ctx.createLinearGradient(x, y, x + w, y);
    edgeVig.addColorStop(0, 'rgba(35, 55, 30, 0.12)');
    edgeVig.addColorStop(0.08, 'rgba(35, 55, 30, 0)');
    edgeVig.addColorStop(0.92, 'rgba(35, 55, 30, 0)');
    edgeVig.addColorStop(1, 'rgba(35, 55, 30, 0.12)');
    ctx.fillStyle = edgeVig;
    ctx.fillRect(x, y, w, h);

    ctx.restore();
    return;
  }

  // Fallback: Soft sage watercolor wash
  drawProceduralBotanicalFallback(ctx, x, y, w, h, scale);
  ctx.restore();
}

/**
 * Soft sage watercolor paper fallback when asset is loading
 */
function drawProceduralBotanicalFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.fillStyle = BOTANICAL_PALETTE.cardBase;
  ctx.fillRect(x, y, w, h);

  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#f9fbf7');
  grad.addColorStop(0.35, '#eef5ea');
  grad.addColorStop(0.7, '#e2eedb');
  grad.addColorStop(1, '#c8dfbe');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Soft subtle organic paper texture stipples
  const rand = seededRandom(42);
  const dustCount = Math.min(300, Math.round(w * h * 0.0003));
  ctx.fillStyle = 'rgba(75, 102, 71, 0.04)';
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
 * Main foreground decorator for Watercolor Eucalyptus Edition:
 * - Renders crisp editorial white paper photo frames with subtle depth shadow (matching Rose & Yellow Rose).
 * - Leaves the authentic watercolor eucalyptus branches seamlessly visible in borders, dividers, and footer.
 */
export function renderBotanicalDecorations(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  slots: LayoutSlot[],
  scale: number
) {
  if (slots.length === 0) return;

  // 1. DELICATE WHITE PHOTO CARD BORDERS (Clean editorial cutout look matching Rose & Yellow Rose)
  ctx.save();
  ctx.strokeStyle = BOTANICAL_PALETTE.borderWhite;
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.shadowColor = 'rgba(30, 50, 25, 0.22)';
  ctx.shadowBlur = 5 * scale;
  ctx.shadowOffsetY = 2 * scale;

  slots.forEach((s) => {
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });
  ctx.restore();
}
