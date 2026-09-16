import { LayoutSlot } from '../state/types.ts';

/**
 * Authentic Impasto Oil Painting Frame Engine (#4 유화 프레임)
 * PIC4U Signature #4: Pastel Impasto Oil Painting Edition
 */

export const OIL_PALETTE = {
  // Rich blended pastel oil colors from reference photo
  lilac: {
    highlight: '#e9d5ff',
    light: '#c084fc',
    mid: '#a855f7',
    deep: '#7e22ce',
    dark: '#581c87',
    shadow: 'rgba(55, 15, 80, 0.42)'
  },
  rose: {
    highlight: '#fce7f3',
    light: '#f472b6',
    mid: '#ec4899',
    deep: '#be185d',
    dark: '#831843',
    shadow: 'rgba(75, 12, 45, 0.42)'
  },
  mint: {
    highlight: '#cffafe',
    light: '#38bdf8',
    mid: '#06b6d4',
    deep: '#0e7490',
    dark: '#155e75',
    shadow: 'rgba(12, 60, 80, 0.42)'
  },
  peach: {
    highlight: '#fff7ed',
    light: '#fed7aa',
    mid: '#fb923c',
    deep: '#c2410c',
    dark: '#7c2d12',
    shadow: 'rgba(70, 30, 10, 0.38)'
  },
  cream: {
    highlight: '#ffffff',
    light: '#fef9c3',
    mid: '#fde047',
    deep: '#eab308',
    dark: '#a16207',
    shadow: 'rgba(60, 50, 15, 0.35)'
  },
  pearlWhite: '#ffffff',
  knifeHighlight: 'rgba(255, 255, 255, 0.82)',
  knifeShadow: 'rgba(40, 20, 55, 0.28)'
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
      try { cb(); } catch (err) { console.error('Oil texture callback error:', err); }
    });
  };
  oilBgImage.onerror = (e) => {
    console.warn('Oil background texture image failed to load, using procedural impasto fallback.', e);
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
 * Draws the masterwork impasto oil painting background.
 * Uses the authentic high-resolution oil painting asset when loaded,
 * with seamless procedural impasto oil fallback.
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
    edgeVig.addColorStop(0, 'rgba(110, 80, 130, 0.09)');
    edgeVig.addColorStop(0.06, 'rgba(110, 80, 130, 0)');
    edgeVig.addColorStop(0.94, 'rgba(110, 80, 130, 0)');
    edgeVig.addColorStop(1, 'rgba(110, 80, 130, 0.09)');
    ctx.fillStyle = edgeVig;
    ctx.fillRect(x, y, w, h);

    ctx.restore();
    return;
  }

  // Fallback: Rich procedural impasto oil painting engine
  drawProceduralOilFallback(ctx, x, y, w, h, scale);
  ctx.restore();
}

/**
 * Rich procedural impasto canvas fallback with multi-color palette knife ribbons
 */
function drawProceduralOilFallback(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  // 1. Base vibrant pastel oil gradient
  const baseGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  baseGrad.addColorStop(0, '#e9d5ff'); // Lilac
  baseGrad.addColorStop(0.28, '#fce7f3'); // Rose blush
  baseGrad.addColorStop(0.62, '#cffafe'); // Mint ice
  baseGrad.addColorStop(0.85, '#fef9c3'); // Buttercream
  baseGrad.addColorStop(1, '#ddd6fe'); // Soft violet
  ctx.fillStyle = baseGrad;
  ctx.fillRect(x, y, w, h);

  // 2. Artist canvas linen weave texture
  const rand = seededRandom(512);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
  const weaveCount = Math.min(600, Math.round(w * h * 0.0004));
  for (let i = 0; i < weaveCount; i++) {
    const wx = x + rand() * w;
    const wy = y + rand() * h;
    const ww = (3 + rand() * 4) * scale;
    const wh = (1.5 + rand() * 2) * scale;
    ctx.fillRect(wx, wy, ww, wh);
  }

  // 3. Sweeping layered impasto palette knife strokes
  const colors = [
    OIL_PALETTE.lilac.mid,
    OIL_PALETTE.rose.mid,
    OIL_PALETTE.mint.mid,
    OIL_PALETTE.cream.light,
    OIL_PALETTE.peach.light,
    OIL_PALETTE.lilac.light,
    OIL_PALETTE.rose.light,
    OIL_PALETTE.mint.light
  ];

  const strokeCount = 55;
  for (let i = 0; i < strokeCount; i++) {
    const sx = x + rand() * w;
    const sy = y + rand() * h;
    const sw = (60 + rand() * 140) * scale;
    const sh = (16 + rand() * 32) * scale;
    const angle = (rand() - 0.5) * 1.2 + (i % 2 === 0 ? 0.35 : -0.35);
    const color = colors[i % colors.length];

    drawPaletteKnifeStroke(ctx, sx, sy, sw, sh, angle, color, scale, 0.45 + rand() * 0.45);
  }
}

/**
 * Draws an impasto palette knife stroke with visible 3D paint ridge lighting
 */
function drawPaletteKnifeStroke(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  length: number,
  width: number,
  angle: number,
  color: string,
  scale: number,
  alpha: number = 0.85
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;

  // 1. Under-stroke soft paint shadow (giving thickness to the paint layer)
  ctx.shadowColor = OIL_PALETTE.knifeShadow;
  ctx.shadowBlur = 5 * scale;
  ctx.shadowOffsetY = 2.5 * scale;

  // 2. Main curved paint smear body
  ctx.beginPath();
  ctx.moveTo(-length * 0.5, -width * 0.3);
  ctx.bezierCurveTo(-length * 0.2, -width * 0.65, length * 0.2, -width * 0.55, length * 0.5, -width * 0.2);
  ctx.bezierCurveTo(length * 0.45, width * 0.45, -length * 0.1, width * 0.65, -length * 0.5, width * 0.3);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  // Reset shadow for crisp knife ridge highlight
  ctx.shadowColor = 'transparent';

  // 3. Crisp palette knife ridge highlight along top bevel
  ctx.beginPath();
  ctx.moveTo(-length * 0.45, -width * 0.25);
  ctx.bezierCurveTo(-length * 0.15, -width * 0.58, length * 0.15, -width * 0.48, length * 0.42, -width * 0.18);
  ctx.strokeStyle = OIL_PALETTE.knifeHighlight;
  ctx.lineWidth = Math.max(1, 1.4 * scale);
  ctx.stroke();

  // 4. Subtle inner color streak
  ctx.beginPath();
  ctx.moveTo(-length * 0.3, 0);
  ctx.lineTo(length * 0.3, 0);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = Math.max(0.8, 1.2 * scale);
  ctx.stroke();

  ctx.restore();
}

/**
 * Main foreground decorator:
 * - Renders crisp editorial white paper borders around photo slots.
 * - Renders divider impasto palette knife streaks bridging slots.
 */
export function renderOilDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  _height: number,
  slots: LayoutSlot[],
  scale: number
) {
  if (slots.length === 0) return;

  // 1. DELICATE WHITE PHOTO CARD BORDERS (Clean editorial cutout look)
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = Math.max(1.2, 1.8 * scale);
  ctx.shadowColor = 'rgba(40, 15, 60, 0.18)';
  ctx.shadowBlur = 4 * scale;
  ctx.shadowOffsetY = 1.5 * scale;

  slots.forEach((s) => {
    ctx.strokeRect(s.x, s.y, s.w, s.h);
  });
  ctx.restore();

  // 2. DIVIDER IMPASTO STROKES (Between slots)
  const is1x4 = slots.length === 4 && slots[0].w > slots[0].h * 1.05;
  if (is1x4) {
    for (let i = 0; i < slots.length - 1; i++) {
      const curr = slots[i];
      const next = slots[i + 1];
      const gapY = (curr.y + curr.h + next.y) / 2;

      // Subtle multi-color smear bridging slots
      drawPaletteKnifeStroke(
        ctx,
        width * 0.46,
        gapY,
        width * 0.68,
        14 * scale,
        0.04,
        i % 2 === 0 ? OIL_PALETTE.mint.mid : OIL_PALETTE.lilac.mid,
        scale,
        0.75
      );

      drawPaletteKnifeStroke(
        ctx,
        width * 0.55,
        gapY + 1 * scale,
        width * 0.52,
        10 * scale,
        -0.07,
        i % 2 === 0 ? OIL_PALETTE.rose.light : OIL_PALETTE.cream.mid,
        scale,
        0.65
      );
    }
  }
}
