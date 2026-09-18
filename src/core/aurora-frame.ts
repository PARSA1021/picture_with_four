import { LayoutSlot } from '../state/types.ts';

/**
 * Authentic Midnight Aurora & Starry Sky Frame Engine
 * PIC4U Signature #6: Midnight Aurora Edition
 * Designed to match the high-end photographic / artistic aesthetic of
 * Botanical Eucalyptus (#1), Romantic Pink Rose (#2), Pure Sky Cloud (#3),
 * Pastel Oil (#4), and Sunshine Yellow Rose (#5).
 */

export const AURORA_PALETTE = {
  cardBase: '#080d1a',
  midnightSky: '#050711',
  auroraTeal: '#10b981',
  auroraCyan: '#06b6d4',
  auroraPurple: '#a855f7',
  auroraViolet: '#6366f1',
  starWhite: '#f8fafc',
  borderWhite: 'rgba(255, 255, 255, 0.96)'
};

// Singleton background image management
let auroraBgImage: HTMLImageElement | null = null;
let isAuroraTextureReady = false;
const textureLoadCallbacks: Array<() => void> = [];

export function onAuroraTextureLoaded(callback: () => void) {
  if (isAuroraTextureReady) {
    callback();
  } else {
    textureLoadCallbacks.push(callback);
  }
}

export function preloadAuroraTexture() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;
  if (auroraBgImage) return;

  auroraBgImage = new Image();
  auroraBgImage.src = '/assets/themes/aurora-frame-bg.jpg';
  auroraBgImage.onload = () => {
    isAuroraTextureReady = true;
    textureLoadCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Aurora texture callback error:', err);
      }
    });
  };
  auroraBgImage.onerror = (e) => {
    console.warn('Aurora background texture image failed to load, using procedural fallback.', e);
  };
}

// Auto-preload on file evaluation
preloadAuroraTexture();

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draws the real masterwork midnight aurora & starry sky card background.
 * Uses the authentic high-resolution aurora photograph asset when loaded,
 * with an atmospheric cosmic aurora gradient fallback.
 */
export function drawAuroraBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.save();

  // If high-resolution aurora asset is ready, draw it with object-fit: cover
  if (auroraBgImage && isAuroraTextureReady && auroraBgImage.naturalWidth > 0) {
    const imgW = auroraBgImage.naturalWidth;
    const imgH = auroraBgImage.naturalHeight;
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

    ctx.drawImage(auroraBgImage, sx, sy, sw, sh, x, y, w, h);

    // Subtle edge framing vignette for editorial warmth and depth
    const edgeVig = ctx.createLinearGradient(x, y, x + w, y);
    edgeVig.addColorStop(0, 'rgba(5, 7, 20, 0.25)');
    edgeVig.addColorStop(0.08, 'rgba(5, 7, 20, 0)');
    edgeVig.addColorStop(0.92, 'rgba(5, 7, 20, 0)');
    edgeVig.addColorStop(1, 'rgba(5, 7, 20, 0.25)');
    ctx.fillStyle = edgeVig;
    ctx.fillRect(x, y, w, h);

    ctx.restore();
    return;
  }

  // Fallback: Soft midnight cosmic aurora wash
  drawProceduralAuroraFallback(ctx, x, y, w, h, scale);
  ctx.restore();
}

/**
 * Atmospheric celestial aurora fallback when asset is loading
 */
function drawProceduralAuroraFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.fillStyle = AURORA_PALETTE.midnightSky;
  ctx.fillRect(x, y, w, h);

  // Deep indigo & teal gradient
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, '#0a0d1d');
  grad.addColorStop(0.3, '#0b292e');
  grad.addColorStop(0.65, '#2e104d');
  grad.addColorStop(1, '#050711');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // Soft glowing aurora ribbons (procedural curves)
  ctx.save();
  ctx.filter = 'blur(16px)';
  const ribbonGrad = ctx.createLinearGradient(x, y + h * 0.15, x + w, y + h * 0.45);
  ribbonGrad.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
  ribbonGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.5)');
  ribbonGrad.addColorStop(1, 'rgba(168, 85, 247, 0.35)');
  ctx.fillStyle = ribbonGrad;
  ctx.beginPath();
  ctx.ellipse(x + w * 0.5, y + h * 0.25, w * 0.6, h * 0.12, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Twinkling stars
  const rand = seededRandom(777);
  const starCount = Math.min(250, Math.round(w * h * 0.0003));
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  for (let i = 0; i < starCount; i++) {
    const px = x + rand() * w;
    const py = y + rand() * h;
    const pr = (rand() * 1.5 + 0.5) * scale;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Main foreground decorator:
 * - Renders crisp editorial white paper borders around photo slots with subtle depth shadow (matching all signature editions).
 * - Leaves the authentic midnight aurora and twinkling starfield textures seamlessly visible in borders, dividers, and footer.
 */
export function renderAuroraDecorations(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  slots: LayoutSlot[],
  scale: number
) {
  if (slots.length === 0) return;

  // 1. DELICATE WHITE PHOTO CARD BORDERS (Clean editorial cutout look matching all signature editions)
  ctx.save();
  ctx.strokeStyle = AURORA_PALETTE.borderWhite;
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.shadowColor = 'rgba(5, 7, 25, 0.45)';
  ctx.shadowBlur = 6 * scale;
  ctx.shadowOffsetY = 2 * scale;

  slots.forEach((s) => {
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });
  ctx.restore();
}
