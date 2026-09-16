import { FrameConfig, LayoutSlot, TextConfig } from '../state/types.ts';
import { calculateLayoutSlots } from './layout-engine.ts';
import { drawWatercolorPaperTexture, renderBotanicalDecorations } from './botanical-frame.ts';
import { drawRoseBackground, renderRoseDecorations } from './rose-frame.ts';
import { drawSkyBackground, renderCloudDecorations } from './cloud-frame.ts';

export interface RenderOptions {
  isExport?: boolean;
  selectedSlotIndex?: number | null;
  baseScreenWidth?: number;
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
  const { isExport = false, selectedSlotIndex = null, baseScreenWidth = 400 } = options;
  const scale = width / baseScreenWidth;

  // 1. Fill entire background
  ctx.fillStyle = config.backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // 2. Compute margin & padding in px
  const marginPx = (width * config.frameMargin) / 100;
  const paddingPx = ((width - marginPx * 2) * config.imagePadding) / 100;

  // 3. Draw outer photo frame card
  const frameW = width - marginPx * 2;
  const frameH = height - marginPx * 2;
  const frameRadius = Math.max(4, config.imageCornerRadius * 1.5);

  if (config.theme === 'botanical-eucalyptus') {
    ctx.save();
    if (!isExport) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
    }
    ctx.fillStyle = '#f9f9f5';
    drawRoundedPath(ctx, marginPx, marginPx, frameW, frameH, frameRadius);
    ctx.fill();
    ctx.clip();
    drawWatercolorPaperTexture(ctx, marginPx, marginPx, frameW, frameH, scale);
    ctx.restore();
  } else if (config.theme === 'romantic-rose') {
    ctx.save();
    if (!isExport) {
      ctx.shadowColor = 'rgba(180, 50, 70, 0.16)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
    }
    ctx.fillStyle = '#fcebee';
    drawRoundedPath(ctx, marginPx, marginPx, frameW, frameH, frameRadius);
    ctx.fill();
    ctx.clip();
    drawRoseBackground(ctx, marginPx, marginPx, frameW, frameH, scale);
    ctx.restore();
  } else if (config.theme === 'sky-cloud') {
    ctx.save();
    if (!isExport) {
      ctx.shadowColor = 'rgba(30, 80, 140, 0.18)';
      ctx.shadowBlur = 16;
      ctx.shadowOffsetY = 6;
    }
    ctx.fillStyle = '#4ba0e3';
    drawRoundedPath(ctx, marginPx, marginPx, frameW, frameH, frameRadius);
    ctx.fill();
    ctx.clip();
    drawSkyBackground(ctx, marginPx, marginPx, frameW, frameH, scale);
    ctx.restore();
  } else {
    ctx.fillStyle = config.frameColor;
    if (!isExport) {
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.06)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      drawRoundedPath(ctx, marginPx, marginPx, frameW, frameH, frameRadius);
      ctx.fill();
      ctx.restore();
    } else {
      drawRoundedPath(ctx, marginPx, marginPx, frameW, frameH, frameRadius);
      ctx.fill();
    }
  }

  // 4. Calculate layout slots
  const slots = calculateLayoutSlots(config.layout, width, height, {
    marginPx,
    paddingPx
  });

  // 5. Draw each slot
  const cornerRadius = config.imageCornerRadius * scale;

  slots.forEach((slot) => {
    const imgData = config.images[slot.index];

    ctx.save();
    drawRoundedPath(ctx, slot.x, slot.y, slot.w, slot.h, cornerRadius);
    ctx.clip();

    if (imgData && imgData.image) {
      const { image, flipped, rotation, filter, zoom, offsetX, offsetY } = imgData;
      const imgRatio = image.width / image.height;
      const slotRatio = slot.w / slot.h;

      let baseW: number;
      let baseH: number;

      if (imgRatio > slotRatio) {
        baseH = slot.h;
        baseW = slot.h * imgRatio;
      } else {
        baseW = slot.w;
        baseH = slot.w / imgRatio;
      }

      const zoomFactor = (zoom || 100) / 100;
      const drawW = baseW * zoomFactor;
      const drawH = baseH * zoomFactor;

      const scaledOffsetX = offsetX * scale;
      const scaledOffsetY = offsetY * scale;

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

  // 5.5 Draw Botanical / Floral / Cloud Overlays if active
  if (config.theme === 'botanical-eucalyptus') {
    renderBotanicalDecorations(ctx, width, height, slots, scale);
  } else if (config.theme === 'romantic-rose') {
    renderRoseDecorations(ctx, width, height, slots, scale);
  } else if (config.theme === 'sky-cloud') {
    renderCloudDecorations(ctx, width, height, slots, scale);
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
    if (
      config.theme !== 'botanical-eucalyptus' &&
      config.theme !== 'romantic-rose' &&
      config.theme !== 'sky-cloud'
    ) {
      ctx.save();
      ctx.font = `600 ${Math.max(9, Math.round(10 * scale))}px "Inter", sans-serif`;
      ctx.fillStyle =
        config.theme === 'modern-black'
          ? 'rgba(255, 255, 255, 0.25)'
          : 'rgba(0, 0, 0, 0.22)';
      ctx.textAlign = 'center';
      ctx.fillText('PIC4U STUDIO · ARCHIVAL PRINT', width * 0.5, height - marginPx * 0.38);
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
  scale: number
) {
  const x = canvasWidth * sticker.x;
  const y = canvasHeight * sticker.y;
  const fontSize = Math.round(sticker.size * scale);

  ctx.save();
  ctx.font = `${fontSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(sticker.emoji, x, y);
  ctx.restore();
}

/**
 * Draws text onto the canvas context with exact font, size, and stroke settings
 */
export function drawCanvasText(
  ctx: CanvasRenderingContext2D,
  textConfig: TextConfig,
  canvasWidth: number,
  canvasHeight: number,
  scale: number
) {
  if (!textConfig.content || !textConfig.content.trim()) return;

  const x = canvasWidth * textConfig.x;
  const y = canvasHeight * textConfig.y;
  const fontSize = Math.round(textConfig.size * scale);

  ctx.save();
  ctx.font = `700 ${fontSize}px "${textConfig.font}", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Apply effects
  if (textConfig.effect === 'soft-shadow') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
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
    ctx.strokeText(textConfig.content, x, y);
  }

  ctx.fillStyle = textConfig.color;
  ctx.fillText(textConfig.content, x, y);
  ctx.restore();
}
