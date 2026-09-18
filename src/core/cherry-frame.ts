import { LayoutSlot } from '../state/types.ts';

/**
 * Authentic Blooming Cherry Blossom Frame Engine
 * PIC4U Signature #7: Spring Cherry Blossom Edition
 * Designed to match the high-end photographic / artistic aesthetic of
 * Botanical Eucalyptus (#1), Romantic Pink Rose (#2), Pure Sky Cloud (#3),
 * Pastel Oil (#4), Sunshine Yellow Rose (#5), and Midnight Aurora (#6).
 */

export const CHERRY_PALETTE = {
  cardBase: '#fff7f8',
  petalPink: '#f9a8d4',
  blushDeep: '#f43f5e',
  springCream: '#fffbeb',
  borderWhite: 'rgba(255, 255, 255, 0.96)'
};

// Singleton background image management
let cherryBgImage: HTMLImageElement | null = null;
let isCherryTextureReady = false;
const textureLoadCallbacks: Array<() => void> = [];

export function onCherryTextureLoaded(callback: () => void) {
  if (isCherryTextureReady) {
    callback();
  } else {
    textureLoadCallbacks.push(callback);
  }
}

export function preloadCherryTexture() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;
  if (cherryBgImage) return;

  cherryBgImage = new Image();
  cherryBgImage.src = '/assets/themes/cherry-frame-bg.jpg';
  cherryBgImage.onload = () => {
    isCherryTextureReady = true;
    textureLoadCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Cherry texture callback error:', err);
      }
    });
  };
  cherryBgImage.onerror = (e) => {
    console.warn('Cherry blossom background texture image failed to load, using procedural fallback.', e);
  };
}

// Auto-preload on file evaluation
preloadCherryTexture();

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draws the real masterwork cherry blossom card background.
 * Uses the authentic high-resolution photograph asset when loaded,
 * with a soft romantic spring watercolor gradient fallback.
 */
export function drawCherryBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.save();

  // If high-resolution cherry blossom asset is ready, draw it with object-fit: cover
  if (cherryBgImage && isCherryTextureReady && cherryBgImage.naturalWidth > 0) {
    const imgW = cherryBgImage.naturalWidth;
    const imgH = cherryBgImage.naturalHeight;
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

    ctx.drawImage(cherryBgImage, sx, sy, sw, sh, x, y, w, h);

    // Subtle edge framing vignette for editorial warmth and softness
    const edgeVig = ctx.createLinearGradient(x, y, x + w, y);
    edgeVig.addColorStop(0, 'rgba(244, 63, 94, 0.08)');
    edgeVig.addColorStop(0.08, 'rgba(244, 63, 94, 0)');
    edgeVig.addColorStop(0.92, 'rgba(244, 63, 94, 0)');
    edgeVig.addColorStop(1, 'rgba(244, 63, 94, 0.08)');
    ctx.fillStyle = edgeVig;
    ctx.fillRect(x, y, w, h);

    ctx.restore();
    return;
  }

  // Fallback: Soft blush cherry blossom gradient wash
  drawProceduralCherryFallback(ctx, x, y, w, h, scale);
  ctx.restore();
}

/**
 * Soft romantic spring blossom wash when asset is loading
 */
function drawProceduralCherryFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.fillStyle = CHERRY_PALETTE.cardBase;
  ctx.fillRect(x, y, w, h);

  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#fff1f2');
  grad.addColorStop(0.45, '#ffe4e6');
  grad.addColorStop(0.8, '#fce7f3');
  grad.addColorStop(1, '#fff7ed');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Soft fluttering petal dots
  const rand = seededRandom(888);
  const petalCount = Math.min(250, Math.round(w * h * 0.0003));
  ctx.fillStyle = 'rgba(244, 63, 94, 0.12)';
  for (let i = 0; i < petalCount; i++) {
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
 * - Leaves the authentic blooming cherry blossom petals and branches seamlessly visible in borders, dividers, and footer.
 */
export function renderCherryDecorations(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  slots: LayoutSlot[],
  scale: number
) {
  if (slots.length === 0) return;

  // 1. DELICATE WHITE PHOTO CARD BORDERS (Clean editorial cutout look matching all signature editions)
  ctx.save();
  ctx.strokeStyle = CHERRY_PALETTE.borderWhite;
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.shadowColor = 'rgba(220, 90, 130, 0.22)';
  ctx.shadowBlur = 5 * scale;
  ctx.shadowOffsetY = 2 * scale;

  slots.forEach((s) => {
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });
  ctx.restore();
}
