import { LayoutSlot } from '../state/types.ts';

/**
 * Pure Sky & Fluffy Clouds Drawing Engine
 * Specifically designed for PIC4U / 인생네컷 signature Sky & Clouds Edition.
 */

const SKY_COLORS = {
  skyTop: '#3b8dd0',
  skyMid: '#5da8e3',
  skyBottom: '#8cc9f2',
  cloudShadow: 'rgba(165, 192, 218, 0.45)',
  cloudMid: 'rgba(240, 247, 255, 0.85)',
  cloudWhite: 'rgba(255, 255, 255, 0.96)',
  cloudHighlight: '#ffffff'
};

function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draws clear blue sky gradient background for the photo frame
 */
export function drawSkyBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  _scale: number
) {
  ctx.save();
  // Clear azure to soft summer sky vertical gradient
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, SKY_COLORS.skyTop);
  grad.addColorStop(0.45, SKY_COLORS.skyMid);
  grad.addColorStop(1, SKY_COLORS.skyBottom);

  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

/**
 * Draws a single organic cloud puff with soft radial gradient
 */
function drawCloudPuff(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  alpha: number,
  scale: number,
  isShadow: boolean = false
) {
  ctx.save();
  const grad = ctx.createRadialGradient(
    cx - radius * 0.15,
    cy - radius * 0.2,
    radius * 0.1,
    cx,
    cy,
    radius
  );

  if (isShadow) {
    grad.addColorStop(0, 'rgba(180, 205, 230, 0.6)');
    grad.addColorStop(0.7, 'rgba(195, 215, 235, 0.35)');
    grad.addColorStop(1, 'rgba(210, 228, 245, 0)');
  } else {
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    grad.addColorStop(0.65, 'rgba(248, 252, 255, 0.88)');
    grad.addColorStop(0.9, 'rgba(240, 248, 255, 0.5)');
    grad.addColorStop(1, 'rgba(235, 245, 255, 0)');
  }

  ctx.globalAlpha = alpha;
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Subtle soft highlight on cloud crest
  if (!isShadow && radius > 12 * scale) {
    ctx.globalAlpha = alpha * 0.7;
    ctx.fillStyle = SKY_COLORS.cloudHighlight;
    ctx.beginPath();
    ctx.arc(cx - radius * 0.2, cy - radius * 0.3, radius * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draws an organic cumulus cloud cluster built from layered cloud puffs
 */
function drawCumulusCloud(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  width: number,
  height: number,
  seed: number,
  scale: number
) {
  const rand = seededRandom(seed);
  const puffCount = 12;

  // 1. Shadow layer underneath cloud
  for (let i = 0; i < puffCount; i++) {
    const t = (i + 0.5) / puffCount;
    const px = centerX + (t - 0.5) * width + (rand() - 0.5) * 14 * scale;
    const py = centerY + height * 0.22 + (rand() - 0.5) * 8 * scale;
    const r = (width / puffCount) * (1.1 + rand() * 0.6) * 1.4;
    drawCloudPuff(ctx, px, py, r, 0.75, scale, true);
  }

  // 2. Mid body layer
  for (let i = 0; i < puffCount; i++) {
    const t = (i + 0.5) / puffCount;
    const px = centerX + (t - 0.5) * width * 0.95 + (rand() - 0.5) * 12 * scale;
    const py = centerY + (rand() - 0.5) * height * 0.25;
    const r = (width / puffCount) * (1.2 + rand() * 0.7) * 1.35;
    drawCloudPuff(ctx, px, py, r, 0.9, scale, false);
  }

  // 3. Bright top billing crests
  const crestCount = 7;
  for (let i = 0; i < crestCount; i++) {
    const t = (i + 0.5) / crestCount;
    const px = centerX + (t - 0.5) * width * 0.75 + (rand() - 0.5) * 10 * scale;
    const py = centerY - height * 0.18 + (rand() - 0.5) * 6 * scale;
    const r = (width / crestCount) * (0.85 + rand() * 0.5) * 1.1;
    drawCloudPuff(ctx, px, py, r, 0.95, scale, false);
  }
}

/**
 * Main function: renders fluffy cloud overlays around the frame borders,
 * dividers, and creates a majestic billowing cloud bank in the footer around "인생네컷".
 */
export function renderCloudDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  slots: LayoutSlot[],
  scale: number
) {
  const is1x4 = slots.length === 4 && slots[0].w > slots[0].h * 1.1;

  const topSlot = slots[0];
  const bottomSlot = slots[slots.length - 1];
  const slotLeft = topSlot ? topSlot.x : width * 0.08;
  const slotRight = topSlot ? topSlot.x + topSlot.w : width * 0.92;
  const slotTop = topSlot ? topSlot.y : height * 0.05;
  const slotBottom = bottomSlot ? bottomSlot.y + bottomSlot.h : height * 0.82;

  // 1. TOP BORDER CLOUDS
  renderTopClouds(ctx, width, slotTop, slotLeft, slotRight, scale);

  // 2. LEFT BORDER FLOATING CLOUDS
  renderSideClouds(ctx, slotLeft * 0.5, slotTop, slotBottom, 1101, scale);

  // 3. RIGHT BORDER FLOATING CLOUDS
  renderSideClouds(ctx, slotRight + (width - slotRight) * 0.5, slotTop, slotBottom, 1202, scale);

  // 4. DIVIDERS FLOATING CLOUD PUFFS
  if (is1x4) {
    for (let i = 0; i < slots.length - 1; i++) {
      const curr = slots[i];
      const next = slots[i + 1];
      const gapY = (curr.y + curr.h + next.y) / 2;
      renderDividerClouds(ctx, width, gapY, slotLeft, slotRight, i, scale);
    }
  }

  // 5. FOOTER BILLOWING CLOUD BANK (Around "인생네컷")
  renderFooterCloudBank(ctx, width, height, slotBottom, scale);
}

function renderTopClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  slotTop: number,
  slotLeft: number,
  slotRight: number,
  scale: number
) {
  // Top-left soft cloud
  drawCumulusCloud(ctx, slotLeft * 0.6, slotTop * 0.5, 60 * scale, 26 * scale, 101, scale);

  // Top-center drifting wisps
  drawCumulusCloud(ctx, w * 0.5, slotTop * 0.4, 75 * scale, 24 * scale, 202, scale);

  // Top-right soft cloud
  drawCumulusCloud(ctx, slotRight + (w - slotRight) * 0.4, slotTop * 0.5, 60 * scale, 26 * scale, 303, scale);
}

function renderSideClouds(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  topY: number,
  bottomY: number,
  seed: number,
  scale: number
) {
  const rand = seededRandom(seed);
  const count = 7;

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const y = topY + t * (bottomY - topY) + (rand() - 0.5) * 16 * scale;
    const x = centerX + (rand() - 0.5) * 10 * scale;
    const cw = (35 + rand() * 25) * scale;
    const ch = (18 + rand() * 12) * scale;

    drawCumulusCloud(ctx, x, y, cw, ch, seed + i * 43, scale);
  }
}

function renderDividerClouds(
  ctx: CanvasRenderingContext2D,
  w: number,
  gapY: number,
  slotLeft: number,
  slotRight: number,
  dividerIdx: number,
  scale: number
) {
  const rand = seededRandom(1301 + dividerIdx * 83);

  // Left corner puff overlapping slot edge
  drawCloudPuff(ctx, slotLeft + 8 * scale, gapY, (14 + rand() * 6) * scale, 0.9, scale, false);
  drawCloudPuff(ctx, slotLeft + 24 * scale, gapY - 2 * scale, (11 + rand() * 5) * scale, 0.85, scale, false);

  // Center subtle cloud wisp
  drawCumulusCloud(ctx, w * 0.5, gapY, 80 * scale, 22 * scale, 1401 + dividerIdx * 37, scale);

  // Right corner puff overlapping slot edge
  drawCloudPuff(ctx, slotRight - 8 * scale, gapY, (14 + rand() * 6) * scale, 0.9, scale, false);
  drawCloudPuff(ctx, slotRight - 24 * scale, gapY + 2 * scale, (11 + rand() * 5) * scale, 0.85, scale, false);
}

function renderFooterCloudBank(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  slotBottom: number,
  scale: number
) {
  const footerH = h - slotBottom;
  const footerMidY = slotBottom + footerH * 0.55;

  // 1. Massive, voluminous bottom cumulus cloud bed
  // Backing shadow cloud bank
  drawCumulusCloud(ctx, w * 0.5, footerMidY + 14 * scale, w * 1.08, footerH * 0.85, 1501, scale);

  // Left billowing cumulus
  drawCumulusCloud(ctx, w * 0.22, footerMidY - 2 * scale, w * 0.55, footerH * 0.78, 1602, scale);

  // Right billowing cumulus
  drawCumulusCloud(ctx, w * 0.78, footerMidY - 2 * scale, w * 0.55, footerH * 0.78, 1703, scale);

  // Center cloud bed embracing "인생네컷"
  drawCumulusCloud(ctx, w * 0.5, footerMidY + 8 * scale, w * 0.85, footerH * 0.65, 1804, scale);

  // Upper wisps softening the border with slot 4
  drawCloudPuff(ctx, w * 0.35, slotBottom + 12 * scale, 22 * scale, 0.92, scale, false);
  drawCloudPuff(ctx, w * 0.65, slotBottom + 12 * scale, 22 * scale, 0.92, scale, false);
  drawCloudPuff(ctx, w * 0.5, slotBottom + 18 * scale, 20 * scale, 0.9, scale, false);
}
