import { LayoutSlot } from '../state/types.ts';

/**
 * Authentic Impasto Oil Painting Frame Engine
 * PIC4U Signature #4: Pastel Impasto Oil Painting Edition
 * Designed to match the high-end photographic / artistic aesthetic of
 * Botanical Eucalyptus (#1), Romantic Pink Rose (#2), Pure Sky Cloud (#3), and Sunshine Yellow (#5).
 */

export const OIL_PALETTE = {
  cardBase: '#f5eefb',
  lavenderDeep: '#7e22ce',
  lavenderMid: '#a855f7',
  roseLight: '#f472b6',
  mintLight: '#38bdf8',
  creamLight: '#fef08a',
  borderWhite: 'rgba(255, 255, 255, 0.96)'
};

// Singleton background image management
let oilBgImage: HTMLImageElement | null = null;
let isOilTextureReady = false;
const textureLoadCallbacks: Array<() => void> = [];

export function onOilTextureLoaded(callback: () => void) {
  if (isOilTextureReady) {
    callback();
  } else {
    textureLoadCallbacks.push(callback);
  }
}

export function preloadOilTexture() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;
  if (oilBgImage) return;

  oilBgImage = new Image();
  oilBgImage.src = '/assets/themes/oil-frame-bg.jpg';
  oilBgImage.onload = () => {
    isOilTextureReady = true;
    textureLoadCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Oil texture callback error:', err);
      }
    });
  };
  oilBgImage.onerror = (e) => {
    console.warn('Oil background texture image failed to load, using procedural fallback.', e);
  };
}

// Auto-preload on file evaluation
preloadOilTexture();

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draws the real masterwork impasto oil painting card background.
 * Uses the authentic high-resolution oil painting asset when loaded,
 * with a soft pastel impasto gradient fallback.
 */
export function drawOilBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.save();

  // If high-resolution oil painting asset is ready, draw it with object-fit: cover
  if (oilBgImage && isOilTextureReady && oilBgImage.naturalWidth > 0) {
    const imgW = oilBgImage.naturalWidth;
    const imgH = oilBgImage.naturalHeight;
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

    ctx.drawImage(oilBgImage, sx, sy, sw, sh, x, y, w, h);

    // Subtle edge framing vignette for editorial warmth
    const edgeVig = ctx.createLinearGradient(x, y, x + w, y);
    edgeVig.addColorStop(0, 'rgba(70, 30, 90, 0.12)');
    edgeVig.addColorStop(0.08, 'rgba(70, 30, 90, 0)');
    edgeVig.addColorStop(0.92, 'rgba(70, 30, 90, 0)');
    edgeVig.addColorStop(1, 'rgba(70, 30, 90, 0.12)');
    ctx.fillStyle = edgeVig;
    ctx.fillRect(x, y, w, h);

    ctx.restore();
    return;
  }

  // Fallback: Soft pastel oil gradient wash
  drawProceduralOilFallback(ctx, x, y, w, h, scale);
  ctx.restore();
}

/**
 * Soft pastel impasto canvas fallback when asset is loading
 */
function drawProceduralOilFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.fillStyle = OIL_PALETTE.cardBase;
  ctx.fillRect(x, y, w, h);

  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#f5eefb');
  grad.addColorStop(0.35, '#e9d5ff');
  grad.addColorStop(0.7, '#fed7aa');
  grad.addColorStop(1, '#fbcfe8');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Soft subtle ambient pigment dust
  const rand = seededRandom(666);
  const dustCount = Math.min(300, Math.round(w * h * 0.0003));
  ctx.fillStyle = 'rgba(168, 85, 247, 0.05)';
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
 * Main foreground decorator:
 * - Renders crisp editorial white paper borders around photo slots with subtle depth shadow (matching all signature editions).
 * - Leaves the authentic creamy impasto oil painting textures seamlessly visible in borders, dividers, and footer.
 */
export function renderOilDecorations(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  slots: LayoutSlot[],
  scale: number
) {
  if (slots.length === 0) return;

  // 1. DELICATE WHITE PHOTO CARD BORDERS (Clean editorial cutout look matching all signature editions)
  ctx.save();
  ctx.strokeStyle = OIL_PALETTE.borderWhite;
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.shadowColor = 'rgba(50, 20, 70, 0.22)';
  ctx.shadowBlur = 5 * scale;
  ctx.shadowOffsetY = 2 * scale;

  slots.forEach((s) => {
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });
  ctx.restore();
}
