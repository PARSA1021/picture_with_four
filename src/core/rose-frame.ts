import { LayoutSlot } from '../state/types.ts';

/**
 * Romantic Pink Rose Garden Drawing Engine
 * Specifically designed for PIC4U / 인생네컷 signature Rose Edition.
 */

const ROSE_COLORS = {
  // Rich dusty & English rose palette matching reference photo
  outerPetal: ['#e88f9e', '#f5b0bd', '#fad2db'],
  midPetal: ['#db6f81', '#ea8c9d', '#f7bdc9'],
  innerPetal: ['#b8455b', '#ce5970', '#e3778c'],
  centerHeart: ['#8f2c41', '#a8374e', '#bf475f'],
  highlight: 'rgba(255, 245, 247, 0.65)',
  shadow: 'rgba(95, 25, 40, 0.28)',
  leafDark: '#4a5938',
  leafMid: '#63754d',
  leafLight: '#859b6b',
  cardBase: '#fcebee'
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
 * Draws rose garden paper/ambient card background
 */
export function drawRoseBackground(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  scale: number
) {
  ctx.save();
  // 1. Soft warm blush rose background
  ctx.fillStyle = ROSE_COLORS.cardBase;
  ctx.fillRect(x, y, w, h);

  // 2. Romantic soft gradient wash
  const grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, 'rgba(255, 235, 238, 0.7)');
  grad.addColorStop(0.5, 'rgba(253, 226, 231, 0.4)');
  grad.addColorStop(1, 'rgba(250, 215, 222, 0.8)');
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);

  // 3. Subtle soft ambient rose petal dust
  const rand = seededRandom(777);
  const dustCount = Math.min(400, Math.round(w * h * 0.0003));
  ctx.fillStyle = 'rgba(220, 120, 140, 0.035)';
  for (let i = 0; i < dustCount; i++) {
    const px = x + rand() * w;
    const py = y + rand() * h;
    const pr = (rand() * 2 + 1) * scale;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws a dark green rose foliage leaf
 */
function drawRoseLeaf(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  length: number,
  width: number,
  angle: number,
  scale: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  const grad = ctx.createLinearGradient(0, -length, 0, length);
  grad.addColorStop(0, ROSE_COLORS.leafDark);
  grad.addColorStop(0.6, ROSE_COLORS.leafMid);
  grad.addColorStop(1, ROSE_COLORS.leafLight);

  ctx.fillStyle = grad;
  ctx.globalAlpha = 0.85;

  ctx.beginPath();
  ctx.moveTo(0, -length);
  ctx.bezierCurveTo(width * 1.2, -length * 0.4, width * 0.9, length * 0.5, 0, length);
  ctx.bezierCurveTo(-width * 0.9, length * 0.5, -width * 1.2, -length * 0.4, 0, -length);
  ctx.closePath();
  ctx.fill();

  // Leaf midrib vein
  ctx.strokeStyle = 'rgba(30, 45, 20, 0.35)';
  ctx.lineWidth = Math.max(0.6, 0.8 * scale);
  ctx.beginPath();
  ctx.moveTo(0, -length * 0.85);
  ctx.lineTo(0, length * 0.85);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a blooming English cabbage / tea rose with multi-layered concentric cupped petals
 */
function drawBloomingRose(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  rotation: number,
  scale: number,
  hasLeaves: boolean = true
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);

  // 1. Under-layer leaves peeking out from under the blossom
  if (hasLeaves) {
    const leafCount = 3;
    for (let l = 0; l < leafCount; l++) {
      const ang = (l * (Math.PI * 2)) / leafCount + 0.35;
      const lx = Math.cos(ang) * radius * 0.65;
      const ly = Math.sin(ang) * radius * 0.65;
      drawRoseLeaf(ctx, lx, ly, radius * 0.6, radius * 0.28, ang + Math.PI / 2, scale);
    }
  }

  // 2. Soft bloom shadow underneath
  ctx.save();
  ctx.shadowColor = ROSE_COLORS.shadow;
  ctx.shadowBlur = 10 * scale;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.88, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(215, 100, 120, 0.15)';
  ctx.fill();
  ctx.restore();

  // Helper to draw petal cup
  const drawPetalRing = (
    count: number,
    r: number,
    petalW: number,
    petalH: number,
    colors: string[],
    offsetAng: number,
    alpha: number
  ) => {
    ctx.globalAlpha = alpha;
    for (let i = 0; i < count; i++) {
      const ang = (i * (Math.PI * 2)) / count + offsetAng;
      const px = Math.cos(ang) * r;
      const py = Math.sin(ang) * r;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(ang + Math.PI / 2);

      const grad = ctx.createRadialGradient(0, petalH * 0.3, petalH * 0.1, 0, 0, petalH * 1.2);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(0.65, colors[1]);
      grad.addColorStop(1, colors[2]);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(-petalW * 0.5, petalH * 0.4);
      ctx.bezierCurveTo(-petalW * 0.6, -petalH * 0.4, petalW * 0.6, -petalH * 0.4, petalW * 0.5, petalH * 0.4);
      ctx.bezierCurveTo(petalW * 0.3, petalH * 0.6, -petalW * 0.3, petalH * 0.6, -petalW * 0.5, petalH * 0.4);
      ctx.closePath();
      ctx.fill();

      // Delicate petal rim highlight
      ctx.strokeStyle = ROSE_COLORS.highlight;
      ctx.lineWidth = Math.max(0.6, 0.75 * scale);
      ctx.stroke();

      ctx.restore();
    }
  };

  // Ring 1: Outer wide cupped petals
  drawPetalRing(7, radius * 0.62, radius * 0.62, radius * 0.52, ROSE_COLORS.outerPetal, 0, 0.94);

  // Ring 2: Mid overlapping petals
  drawPetalRing(6, radius * 0.44, radius * 0.5, radius * 0.42, ROSE_COLORS.midPetal, 0.45, 0.95);

  // Ring 3: Inner cupped petals
  drawPetalRing(5, radius * 0.28, radius * 0.38, radius * 0.32, ROSE_COLORS.innerPetal, 0.9, 0.97);

  // Ring 4: Tight spiral center heart
  ctx.globalAlpha = 0.98;
  const centerGrad = ctx.createRadialGradient(0, 0, radius * 0.05, 0, 0, radius * 0.22);
  centerGrad.addColorStop(0, ROSE_COLORS.centerHeart[0]);
  centerGrad.addColorStop(0.6, ROSE_COLORS.centerHeart[1]);
  centerGrad.addColorStop(1, ROSE_COLORS.centerHeart[2]);

  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Spiral swirl detail inside center heart
  ctx.strokeStyle = ROSE_COLORS.outerPetal[2];
  ctx.lineWidth = Math.max(0.8, 1.1 * scale);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.12, 0.2, Math.PI * 1.4);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(radius * 0.04, -radius * 0.02, radius * 0.06, 0.8, Math.PI * 1.9);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a small rosebud
 */
function drawRoseBud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  angle: number,
  scale: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Green calyx leaves
  drawRoseLeaf(ctx, -size * 0.3, size * 0.2, size * 0.7, size * 0.25, -0.4, scale);
  drawRoseLeaf(ctx, size * 0.3, size * 0.2, size * 0.7, size * 0.25, 0.4, scale);

  // Bud petals
  const grad = ctx.createLinearGradient(0, size * 0.6, 0, -size * 0.6);
  grad.addColorStop(0, ROSE_COLORS.innerPetal[0]);
  grad.addColorStop(0.6, ROSE_COLORS.midPetal[1]);
  grad.addColorStop(1, ROSE_COLORS.outerPetal[1]);

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.7);
  ctx.bezierCurveTo(size * 0.5, -size * 0.2, size * 0.4, size * 0.6, 0, size * 0.7);
  ctx.bezierCurveTo(-size * 0.4, size * 0.6, -size * 0.5, -size * 0.2, 0, -size * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = ROSE_COLORS.highlight;
  ctx.lineWidth = Math.max(0.6, 0.8 * scale);
  ctx.stroke();

  ctx.restore();
}

/**
 * Main function: renders the full blooming rose garden decorations.
 * Matches the user reference image with dense roses along borders, dividers,
 * and a rich blooming flower bed across the footer around "인생네컷".
 */
export function renderRoseDecorations(
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

  // 1. TOP BORDER ROSES
  renderTopRoses(ctx, width, slotTop, slotLeft, slotRight, scale);

  // 2. LEFT BORDER ROSES & PETALS
  renderLeftBorderRoses(ctx, slotLeft, slotTop, slotBottom, scale);

  // 3. RIGHT BORDER ROSES & PETALS
  renderRightBorderRoses(ctx, width, slotRight, slotTop, slotBottom, scale);

  // 4. DIVIDERS ROSES & PETALS
  if (is1x4) {
    for (let i = 0; i < slots.length - 1; i++) {
      const curr = slots[i];
      const next = slots[i + 1];
      const gapY = (curr.y + curr.h + next.y) / 2;
      renderDividerRoses(ctx, width, gapY, slotLeft, slotRight, i, scale);
    }
  }

  // 5. FOOTER BLOOMING ROSE BED (Around "인생네컷")
  renderFooterRoseBed(ctx, width, height, slotBottom, scale);
}

function renderTopRoses(
  ctx: CanvasRenderingContext2D,
  w: number,
  slotTop: number,
  slotLeft: number,
  slotRight: number,
  scale: number
) {
  // Top-left hero rose & buds
  drawBloomingRose(ctx, slotLeft * 0.5, slotTop * 0.5, 20 * scale, 0.4, scale, true);
  drawRoseBud(ctx, slotLeft + 16 * scale, slotTop * 0.4, 11 * scale, 0.6, scale);

  // Top-center gentle petals & leaves
  drawRoseLeaf(ctx, w * 0.5 - 20 * scale, slotTop * 0.45, 12 * scale, 6 * scale, 0.7, scale);
  drawRoseBud(ctx, w * 0.5, slotTop * 0.4, 10 * scale, -0.2, scale);
  drawRoseLeaf(ctx, w * 0.5 + 20 * scale, slotTop * 0.45, 12 * scale, 6 * scale, -0.7, scale);

  // Top-right hero rose & buds
  drawBloomingRose(ctx, slotRight + (w - slotRight) * 0.5, slotTop * 0.5, 20 * scale, -0.5, scale, true);
  drawRoseBud(ctx, slotRight - 16 * scale, slotTop * 0.4, 11 * scale, -0.6, scale);
}

function renderLeftBorderRoses(
  ctx: CanvasRenderingContext2D,
  slotLeft: number,
  topY: number,
  bottomY: number,
  scale: number
) {
  const rand = seededRandom(808);
  const count = 10;

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const y = topY + t * (bottomY - topY);
    const x = slotLeft * (0.35 + rand() * 0.35);
    const radius = (13 + rand() * 8) * scale;
    const rot = rand() * Math.PI * 2;

    if (i % 3 === 1) {
      drawRoseBud(ctx, x, y, (10 + rand() * 4) * scale, rand() * 2 - 1, scale);
    } else {
      drawBloomingRose(ctx, x, y, radius, rot, scale, true);
    }
  }
}

function renderRightBorderRoses(
  ctx: CanvasRenderingContext2D,
  w: number,
  slotRight: number,
  topY: number,
  bottomY: number,
  scale: number
) {
  const rightMargin = w - slotRight;
  const rand = seededRandom(909);
  const count = 10;

  for (let i = 0; i < count; i++) {
    const t = (i + 0.5) / count;
    const y = topY + t * (bottomY - topY);
    const x = slotRight + rightMargin * (0.35 + rand() * 0.35);
    const radius = (13 + rand() * 8) * scale;
    const rot = rand() * Math.PI * 2;

    if (i % 3 === 2) {
      drawRoseBud(ctx, x, y, (10 + rand() * 4) * scale, rand() * 2 - 1, scale);
    } else {
      drawBloomingRose(ctx, x, y, radius, rot, scale, true);
    }
  }
}

function renderDividerRoses(
  ctx: CanvasRenderingContext2D,
  w: number,
  gapY: number,
  slotLeft: number,
  slotRight: number,
  dividerIdx: number,
  scale: number
) {
  const rand = seededRandom(1001 + dividerIdx * 67);

  // Left corner rose cluster overlapping divider
  drawBloomingRose(
    ctx,
    slotLeft + 4 * scale,
    gapY,
    (14 + rand() * 4) * scale,
    rand() * Math.PI * 2,
    scale,
    true
  );
  drawRoseLeaf(ctx, slotLeft + 22 * scale, gapY - 3 * scale, 11 * scale, 5 * scale, 0.8, scale);

  // Center subtle rosebud or small bloom
  if (dividerIdx % 2 === 0) {
    drawBloomingRose(
      ctx,
      w * 0.5,
      gapY,
      (11 + rand() * 3) * scale,
      rand() * Math.PI * 2,
      scale,
      false
    );
  } else {
    drawRoseBud(ctx, w * 0.5, gapY, 9 * scale, 0.4, scale);
  }

  // Right corner rose cluster overlapping divider
  drawBloomingRose(
    ctx,
    slotRight - 4 * scale,
    gapY,
    (14 + rand() * 4) * scale,
    rand() * Math.PI * 2,
    scale,
    true
  );
  drawRoseLeaf(ctx, slotRight - 22 * scale, gapY + 3 * scale, 11 * scale, 5 * scale, -0.8, scale);
}

function renderFooterRoseBed(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  slotBottom: number,
  scale: number
) {
  const footerHeight = h - slotBottom;
  const footerMidY = slotBottom + footerHeight * 0.5;

  // 1. Lush rose bed across bottom edge
  const bottomRoses = [
    { x: w * 0.08, y: h - 14 * scale, r: 24, rot: 0.2 },
    { x: w * 0.24, y: h - 12 * scale, r: 22, rot: -0.4 },
    { x: w * 0.42, y: h - 10 * scale, r: 20, rot: 0.6 },
    { x: w * 0.60, y: h - 11 * scale, r: 21, rot: -0.3 },
    { x: w * 0.78, y: h - 12 * scale, r: 23, rot: 0.5 },
    { x: w * 0.92, y: h - 14 * scale, r: 25, rot: -0.2 }
  ];

  bottomRoses.forEach((br) => {
    drawBloomingRose(ctx, br.x, br.y, br.r * scale, br.rot, scale, true);
  });

  // 2. Middle rose cluster flanking "인생네컷"
  // Left hero rose
  drawBloomingRose(ctx, w * 0.16, footerMidY - 4 * scale, 25 * scale, 0.8, scale, true);
  drawBloomingRose(ctx, w * 0.28, footerMidY + 12 * scale, 21 * scale, -0.5, scale, true);

  // Right hero rose
  drawBloomingRose(ctx, w * 0.84, footerMidY - 4 * scale, 25 * scale, -0.8, scale, true);
  drawBloomingRose(ctx, w * 0.72, footerMidY + 12 * scale, 21 * scale, 0.5, scale, true);

  // Upper footer roses right below the 4th slot
  drawBloomingRose(ctx, w * 0.38, slotBottom + 16 * scale, 18 * scale, 0.3, scale, false);
  drawBloomingRose(ctx, w * 0.62, slotBottom + 16 * scale, 18 * scale, -0.3, scale, false);
}
