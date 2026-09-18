import { LayoutSlot } from '../state/types.ts';

/**
 * Authentic Sunset Lavender & Purple Garden Frame Engine
 * PIC4U Signature #8: Sunset Lavender Edition
 * Designed to match the high-end photographic / artistic aesthetic of
 * Botanical Eucalyptus (#1), Romantic Pink Rose (#2), Pure Sky Cloud (#3),
 * Pastel Oil (#4), Sunshine Yellow Rose (#5), Midnight Aurora (#6),
 * and Spring Cherry Blossom (#7).
 */

export const LAVENDER_PALETTE = {
  sunsetPeach: '#fed7aa',
  lavenderMist: '#c084fc',
  twilightPurple: '#7c3aed',
  deepViolet: '#3b0764',
  borderWhite: 'rgba(255, 255, 255, 0.96)'
};

// Singleton background image management
let lavenderBgImage: HTMLImageElement | null = null;
let isLavenderTextureReady = false;
const textureLoadCallbacks: Array<() => void> = [];

export function onLavenderTextureLoaded(callback: () => void) {
  if (isLavenderTextureReady) {
    callback();
  } else {
    textureLoadCallbacks.push(callback);
  }
}

export function preloadLavenderTexture() {
  if (typeof window === 'undefined' || typeof Image === 'undefined') return;
  if (lavenderBgImage) return;

  lavenderBgImage = new Image();
  lavenderBgImage.src = '/assets/themes/lavender-frame-bg.jpg';
  lavenderBgImage.onload = () => {
    isLavenderTextureReady = true;
    textureLoadCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Lavender texture callback error:', err);
      }
    });
  };
  lavenderBgImage.onerror = (e) => {
    console.warn('Sunset lavender background texture image failed to load, using procedural fallback.', e);
  };
}

// Auto-preload on file evaluation
preloadLavenderTexture();

/**
 * Draws the real masterwork sunset lavender card background.
 * Uses the authentic high-resolution photograph asset when loaded,
 * with a soft romantic twilight watercolor gradient fallback.
 */
export function drawLavenderBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  _scale: number
) {
  ctx.save();

  // If high-resolution lavender asset is ready, draw it with object-fit: cover
  if (lavenderBgImage && isLavenderTextureReady && lavenderBgImage.naturalWidth > 0) {
    const imgW = lavenderBgImage.naturalWidth;
    const imgH = lavenderBgImage.naturalHeight;
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

    ctx.drawImage(lavenderBgImage, sx, sy, sw, sh, x, y, w, h);

    // Subtle soft twilight vignette
    const vignette = ctx.createRadialGradient(
      x + w * 0.5,
      y + h * 0.35,
      w * 0.25,
      x + w * 0.5,
      y + h * 0.5,
      w * 0.85
    );
    vignette.addColorStop(0, 'rgba(255, 245, 235, 0.04)');
    vignette.addColorStop(0.7, 'rgba(124, 58, 237, 0.05)');
    vignette.addColorStop(1, 'rgba(59, 7, 100, 0.16)');

    ctx.fillStyle = vignette;
    ctx.fillRect(x, y, w, h);
  } else {
    // Procedural Fallback: Twilight Sunset Gradient with Lavender & Peach
    const skyGrad = ctx.createLinearGradient(x, y, x, y + h);
    skyGrad.addColorStop(0, '#fef3c7'); // Warm sunset glow
    skyGrad.addColorStop(0.2, '#fde68a');
    skyGrad.addColorStop(0.4, '#f472b6'); // Sunset rose
    skyGrad.addColorStop(0.7, '#c084fc'); // Lavender
    skyGrad.addColorStop(1, '#4c1d95'); // Deep twilight violet

    ctx.fillStyle = skyGrad;
    ctx.fillRect(x, y, w, h);

    // Soft twilight glow overlay
    const glow = ctx.createRadialGradient(
      x + w * 0.5,
      y + h * 0.25,
      w * 0.05,
      x + w * 0.5,
      y + h * 0.25,
      w * 0.65
    );
    glow.addColorStop(0, 'rgba(254, 243, 199, 0.45)');
    glow.addColorStop(0.6, 'rgba(244, 114, 182, 0.2)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x, y, w, h);
  }

  ctx.restore();
}

/**
 * Draws pristine white cutout borders around photo slots with a soft twilight glow
 */
export function drawLavenderBorders(
  ctx: CanvasRenderingContext2D,
  slots: LayoutSlot[],
  scale: number,
  radius: number
) {
  ctx.save();

  const borderWidth = Math.max(2, Math.round(3.5 * scale));

  slots.forEach((slot) => {
    const bx = slot.x - borderWidth * 0.5;
    const by = slot.y - borderWidth * 0.5;
    const bw = slot.w + borderWidth;
    const bh = slot.h + borderWidth;
    const br = Math.max(0, radius + borderWidth * 0.5);

    // Soft romantic twilight shadow
    ctx.save();
    ctx.shadowColor = 'rgba(76, 29, 149, 0.28)';
    ctx.shadowBlur = Math.round(8 * scale);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(2 * scale);

    ctx.strokeStyle = LAVENDER_PALETTE.borderWhite;
    ctx.lineWidth = borderWidth;

    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, br);
    ctx.stroke();
    ctx.restore();

    // Secondary crisp inner hairline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(1, Math.round(1 * scale));
    ctx.beginPath();
    ctx.roundRect(slot.x, slot.y, slot.w, slot.h, radius);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Main foreground decorator:
 * - Renders crisp editorial white paper borders around photo slots with subtle twilight shadow (matching all signature editions).
 * - Leaves the authentic blooming lavender flowers and twilight glow seamlessly visible in borders, dividers, and footer.
 */
export function renderLavenderDecorations(
  ctx: CanvasRenderingContext2D,
  _width: number,
  _height: number,
  slots: LayoutSlot[],
  scale: number
) {
  if (slots.length === 0) return;

  ctx.save();
  ctx.strokeStyle = LAVENDER_PALETTE.borderWhite;
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.shadowColor = 'rgba(76, 29, 149, 0.26)';
  ctx.shadowBlur = 5 * scale;
  ctx.shadowOffsetY = 2 * scale;

  slots.forEach((s) => {
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });
  ctx.restore();
}
