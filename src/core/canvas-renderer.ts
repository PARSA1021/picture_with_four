import { FrameConfig, LayoutSlot, TextConfig } from '../state/types.ts';
import { calculateLayoutSlots } from './layout-engine.ts';
import { drawWatercolorPaperTexture, renderBotanicalDecorations } from './botanical-frame.ts';
import { drawRoseBackground, renderRoseDecorations } from './rose-frame.ts';
import { drawSkyBackground, renderCloudDecorations } from './cloud-frame.ts';
import { drawOilBackground, renderOilDecorations } from './oil-frame.ts';

export interface RenderOptions {
  isExport?: boolean;
  selectedSlotIndex?: number | null;
  baseScreenWidth?: number;
}

// Pre-rendered layer caches for 60fps silky smooth rendering
interface CachedLayer {
  key: string;
  canvas: HTMLCanvasElement;
}

let bgCache: CachedLayer | null = null;
let decorCache: CachedLayer | null = null;

export function clearLayerCache() {
  bgCache = null;
  decorCache = null;
}

function createOffscreenCanvas(w: number, h: number): HTMLCanvasElement | null {
  if (typeof document === 'undefined') return null;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
    return canvas;
  } catch {
    return null;
  }
}

/**
 * Draws rounded rectangle path on canvas
 */
export function drawRoundedPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  const maxR = Math.min(w / 2, h / 2);
  const radius = Math.max(0, Math.min(r, maxR));

  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }
}

/**
 * Renders the entire Frame Diary scene onto the target canvas context.
 * Returns the computed slots.
 */
export function renderScene(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: FrameConfig,
  options: RenderOptions = {}
): LayoutSlot[] {
  const { isExport = false, selectedSlotIndex = null, baseScreenWidth = 330 } = options;
  const scale = width / baseScreenWidth;

  // 1. Draw photopaper card background with offscreen layer cache
  const bgKey = `${config.theme}_${config.frameColor}_${width}_${height}_${scale.toFixed(3)}`;
  if (!bgCache || bgCache.key !== bgKey) {
    const offscreen = createOffscreenCanvas(width, height);
    const bgCtx = offscreen ? offscreen.getContext('2d') : null;
    const targetCtx = bgCtx || ctx;

    if (config.theme === 'botanical-eucalyptus') {
      drawWatercolorPaperTexture(targetCtx, 0, 0, width, height, scale);
    } else if (config.theme === 'romantic-rose') {
      drawRoseBackground(targetCtx, 0, 0, width, height, scale);
    } else if (config.theme === 'sky-cloud') {
      drawSkyBackground(targetCtx, 0, 0, width, height, scale);
    } else if (config.theme === 'pastel-oil') {
      drawOilBackground(targetCtx, 0, 0, width, height, scale);
    } else {
      targetCtx.fillStyle = config.frameColor;
      targetCtx.fillRect(0, 0, width, height);
    }

    if (offscreen && bgCtx) {
      bgCache = { key: bgKey, canvas: offscreen };
    }
  }

  if (bgCache && bgCache.key === bgKey) {
    ctx.drawImage(bgCache.canvas, 0, 0);
  }

  // 2. Compute margin & padding in px (margin is the card frame border around slots)
  const marginPx = (width * config.frameMargin) / 100;
  const paddingPx = ((width - marginPx * 2) * config.imagePadding) / 100;

  // 3. Calculate layout slots
  const slots = calculateLayoutSlots(config.layout, width, height, {
    marginPx,
    paddingPx
  });

  // 4. Draw each slot
  const cornerRadius = config.imageCornerRadius * scale;

  slots.forEach((slot) => {
    const imgData = config.images[slot.index];

    ctx.save();
    drawRoundedPath(ctx, slot.x, slot.y, slot.w, slot.h, cornerRadius);
    ctx.clip();

    if (imgData && imgData.image) {
      const { image, flipped, rotation, filter, zoom, offsetX, offsetY } = imgData;
      const isRotated90 = rotation === 90 || rotation === 270;
      const imgRatio = image.width / image.height;
      const slotRatio = slot.w / slot.h;

      let baseW: number;
      let baseH: number;

      if (isRotated90) {
        // When rotated 90 or 270 degrees, effective aspect ratio is inverted
        const effectiveAspect = 1 / imgRatio;
        if (effectiveAspect > slotRatio) {
          baseW = slot.h;
          baseH = slot.h * effectiveAspect;
        } else {
          baseH = slot.w;
          baseW = slot.w * imgRatio;
        }
      } else {
        if (imgRatio > slotRatio) {
          baseH = slot.h;
          baseW = slot.h * imgRatio;
        } else {
          baseW = slot.w;
          baseH = slot.w / imgRatio;
        }
      }

      const zoomFactor = (zoom || 100) / 100;
      const drawW = baseW * zoomFactor;
      const drawH = baseH * zoomFactor;

      // Scaled pan offsets proportional to slot size (base reference 320px)
      const slotScale = slot.w / 320;
      const scaledOffsetX = (offsetX || 0) * slotScale;
      const scaledOffsetY = (offsetY || 0) * slotScale;

      const cx = slot.x + slot.w / 2;
      const cy = slot.y + slot.h / 2;

      // Translate to slot center with user offset
      ctx.translate(cx + scaledOffsetX, cy + scaledOffsetY);

      // Apply horizontal flip if enabled
      if (flipped) {
        ctx.scale(-1, 1);
      }

      // Apply 90-degree rotations
      if (rotation) {
        ctx.rotate((rotation * Math.PI) / 180);
      }

      // Apply filter
      if (filter === 'sepia') {
        ctx.filter = 'sepia(0.85) contrast(0.95)';
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    } else {
      // Empty slot placeholder
      ctx.fillStyle = isExport ? '#f3f4f6' : '#f9fafb';
      ctx.fillRect(slot.x, slot.y, slot.w, slot.h);

      // Empty slot placeholder with editorial photo studio styling
      ctx.strokeStyle =
        config.theme === 'modern-black'
          ? 'rgba(255, 255, 255, 0.16)'
          : 'rgba(20, 20, 22, 0.12)';
      ctx.lineWidth = Math.max(1, 1.2 * scale);
      ctx.setLineDash([4 * scale, 4 * scale]);
      drawRoundedPath(ctx, slot.x, slot.y, slot.w, slot.h, cornerRadius);
      ctx.stroke();
      ctx.setLineDash([]);

      // Plus symbol
      ctx.fillStyle =
        config.theme === 'modern-black'
          ? 'rgba(255, 255, 255, 0.35)'
          : 'rgba(20, 20, 22, 0.3)';
      ctx.font = `400 ${Math.max(16, 20 * scale)}px "Inter", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('+', slot.x + slot.w / 2, slot.y + slot.h / 2 - 7 * scale);

      ctx.font = `600 ${Math.max(9, 10 * scale)}px "Inter", sans-serif`;
      ctx.letterSpacing = '0.08em';
      ctx.fillText(`SLOT ${String(slot.index + 1).padStart(2, '0')}`, slot.x + slot.w / 2, slot.y + slot.h / 2 + 13 * scale);
    }

    ctx.restore();

    // Slot selection highlight (on-screen only)
    if (!isExport && selectedSlotIndex === slot.index) {
      ctx.save();
      ctx.strokeStyle = '#141416';
      ctx.lineWidth = 3 * scale;
      drawRoundedPath(ctx, slot.x, slot.y, slot.w, slot.h, cornerRadius);
      ctx.stroke();

      // Selected badge
      const badgeR = 12 * scale;
      const bx = slot.x + slot.w - badgeR - 6 * scale;
      const by = slot.y + badgeR + 6 * scale;
      ctx.fillStyle = '#141416';
      ctx.beginPath();
      ctx.arc(bx, by, badgeR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${11 * scale}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', bx, by);
      ctx.restore();
    }
  });

  // 5. Draw Botanical / Floral / Cloud Overlays with layer caching
  const isSignatureTheme =
    config.theme === 'botanical-eucalyptus' ||
    config.theme === 'romantic-rose' ||
    config.theme === 'sky-cloud' ||
    config.theme === 'pastel-oil';

  if (isSignatureTheme) {
    const decorKey = `${config.theme}_${width}_${height}_${scale.toFixed(3)}_${config.layout}_${marginPx.toFixed(1)}_${paddingPx.toFixed(1)}`;
    if (!decorCache || decorCache.key !== decorKey) {
      const offscreen = createOffscreenCanvas(width, height);
      const decorCtx = offscreen ? offscreen.getContext('2d') : null;
      const targetCtx = decorCtx || ctx;

      if (config.theme === 'botanical-eucalyptus') {
        renderBotanicalDecorations(targetCtx, width, height, slots, scale);
      } else if (config.theme === 'romantic-rose') {
        renderRoseDecorations(targetCtx, width, height, slots, scale);
      } else if (config.theme === 'sky-cloud') {
        renderCloudDecorations(targetCtx, width, height, slots, scale);
      } else if (config.theme === 'pastel-oil') {
        renderOilDecorations(targetCtx, width, height, slots, scale);
      }

      if (offscreen && decorCtx) {
        decorCache = { key: decorKey, canvas: offscreen };
      }
    }

    if (decorCache && decorCache.key === decorKey) {
      ctx.drawImage(decorCache.canvas, 0, 0);
    }
  }

  // 6. Draw Texts for Export (or when rendered on canvas)
  if (isExport) {
    drawCanvasText(ctx, config.mainText, width, height, scale);
    drawCanvasText(ctx, config.subText, width, height, scale);

    // 7. Draw Stickers for Export
    if (config.stickers && config.stickers.length > 0) {
      config.stickers.forEach((sticker) => {
        drawCanvasSticker(ctx, sticker, width, height, scale);
      });
    }

    // 8. Draw Micro Archival Studio Stamp for Export
    if (!isSignatureTheme) {
      ctx.save();
      ctx.font = `600 ${Math.max(9, Math.round(10 * scale))}px "Inter", sans-serif`;
      ctx.fillStyle =
        config.theme === 'modern-black'
          ? 'rgba(255, 255, 255, 0.25)'
          : 'rgba(0, 0, 0, 0.22)';
      ctx.textAlign = 'center';
      ctx.fillText('PIC4U STUDIO · ARCHIVAL PRINT', width * 0.5, height - (height * 0.022));
      ctx.restore();
    }
  }

  return slots;
}

export function drawCanvasSticker(
  ctx: CanvasRenderingContext2D,
  sticker: import('../state/types.ts').StickerItem,
  canvasWidth: number,
  canvasHeight: number,
  _scale: number
) {
  const x = canvasWidth * sticker.x;
  const y = canvasHeight * sticker.y;
  const basePreviewWidth = 330;
  const fontSize = Math.round(sticker.size * (canvasWidth / basePreviewWidth));

  ctx.save();
  ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sticker.emoji, x, y);
  ctx.restore();
}

/**
 * Draws text onto the canvas context with exact font, size, auto-fitting to bounds, and stroke settings
 */
export function drawCanvasText(
  ctx: CanvasRenderingContext2D,
  textConfig: TextConfig,
  canvasWidth: number,
  canvasHeight: number,
  scale: number
) {
  if (!textConfig.content || !textConfig.content.trim()) return;

  const rawX = canvasWidth * textConfig.x;
  const rawY = canvasHeight * textConfig.y;
  const basePreviewWidth = 330;

  ctx.save();

  // 1. Calculate base font size
  let fontSize = Math.round(textConfig.size * (canvasWidth / basePreviewWidth));
  ctx.font = `700 ${fontSize}px "${textConfig.font}", sans-serif`;

  // 2. Safe printable bounds check (prevent any clipping at canvas left/right edges)
  const safeMarginX = canvasWidth * 0.06;
  const maxAllowedWidth = canvasWidth - safeMarginX * 2;
  let textMetrics = ctx.measureText(textConfig.content);

  if (textMetrics.width > maxAllowedWidth && textMetrics.width > 0) {
    // Dynamically downscale font size so the entire text fits cleanly inside the card
    const fitFactor = maxAllowedWidth / textMetrics.width;
    fontSize = Math.max(14, Math.floor(fontSize * fitFactor));
    ctx.font = `700 ${fontSize}px "${textConfig.font}", sans-serif`;
    textMetrics = ctx.measureText(textConfig.content);
  }

  // 3. Clamp X and Y to strictly remain within visible canvas boundaries
  const halfTextW = textMetrics.width / 2;
  const clampedX = Math.max(
    safeMarginX + halfTextW,
    Math.min(canvasWidth - safeMarginX - halfTextW, rawX)
  );

  const halfTextH = fontSize / 2;
  const clampedY = Math.max(
    halfTextH + 8 * scale,
    Math.min(canvasHeight - halfTextH - 12 * scale, rawY)
  );

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 4. Apply text effects
  if (textConfig.effect === 'soft-shadow') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 10 * scale;
    ctx.shadowOffsetY = 4 * scale;
  }

  // Draw stroke if configured or sticker effect
  if (
    textConfig.effect === 'sticker-outline' ||
    (textConfig.strokeWidth && textConfig.strokeWidth > 0)
  ) {
    const sw = textConfig.strokeWidth || 3;
    const sc =
      textConfig.strokeColor ||
      (textConfig.color === '#ffffff' || textConfig.color === '#fafafa' ? '#000000' : '#ffffff');
    ctx.strokeStyle = sc;
    ctx.lineWidth = sw * scale * 2;
    ctx.lineJoin = 'round';
    ctx.strokeText(textConfig.content, clampedX, clampedY);
  }

  ctx.fillStyle = textConfig.color;
  ctx.fillText(textConfig.content, clampedX, clampedY);
  ctx.restore();
}
