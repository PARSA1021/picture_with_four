import { LayoutSlot } from '../state/types.ts';

/**
 * Botanical Eucalyptus & Watercolor Leaves Drawing Engine
 * Specifically designed for PIC4U / 인생네컷 signature frame edition.
 */

// Curated watercolor botanical color palette matching reference photo
const BOTANICAL_COLORS = {
  sage: ['#789c77', '#8cae8b', '#9ebb9c'],
  olive: ['#697e55', '#7b9264', '#8fa776'],
  fresh: ['#9dbb7d', '#aecb8d', '#c2dba4'],
  deep: ['#4b6647', '#3d5639', '#577553'],
  soft: ['#b4ccb0', '#c5d9c2', '#d5e4d2'],
  stem: '#766c55',
  stemDark: '#5e5643',
  paperBase: '#f9f9f5',
  vein: 'rgba(55, 78, 52, 0.45)'
};

/**
 * Deterministic pseudo-random helper for consistent artistic rendering without random jitter
 */
function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Draws realistic watercolor paper texture onto canvas
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
  // 1. Base warm cream watercolor paper
  ctx.fillStyle = BOTANICAL_COLORS.paperBase;
  ctx.fillRect(x, y, w, h);

  // 2. Subtle watercolor wash gradient
  const wash = ctx.createLinearGradient(x, y, x + w, y + h);
  wash.addColorStop(0, 'rgba(242, 246, 238, 0.6)');
  wash.addColorStop(0.3, 'rgba(255, 255, 255, 0.2)');
  wash.addColorStop(0.7, 'rgba(238, 243, 234, 0.4)');
  wash.addColorStop(1, 'rgba(247, 246, 240, 0.5)');
  ctx.fillStyle = wash;
  ctx.fillRect(x, y, w, h);

  // 3. Subtle organic paper fiber stipples
  const rand = seededRandom(42);
  const dotCount = Math.min(600, Math.round(w * h * 0.0004));
  ctx.fillStyle = 'rgba(120, 115, 100, 0.025)';
  for (let i = 0; i < dotCount; i++) {
    const px = x + rand() * w;
    const py = y + rand() * h;
    const pr = (rand() * 1.5 + 0.5) * scale;
    ctx.beginPath();
    ctx.arc(px, py, pr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draws a single watercolor eucalyptus leaf with organic curvature and midrib vein
 */
function drawWatercolorLeaf(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  centerY: number,
  rx: number,
  ry: number,
  angle: number,
  colorType: 'sage' | 'olive' | 'fresh' | 'deep' | 'soft',
  opacity: number,
  scale: number,
  hasVein: boolean = true
) {
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);

  const colors = BOTANICAL_COLORS[colorType];
  const c1 = colors[0];
  const c2 = colors[1];

  // Watercolor double wash with soft gradient
  const grad = ctx.createLinearGradient(-rx, -ry, rx, ry);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);

  ctx.globalAlpha = opacity * 0.88;
  ctx.fillStyle = grad;

  // Organic leaf shape using bezier curve
  ctx.beginPath();
  ctx.moveTo(0, -ry);
  ctx.bezierCurveTo(rx * 1.25, -ry * 0.6, rx * 1.15, ry * 0.65, 0, ry);
  ctx.bezierCurveTo(-rx * 1.15, ry * 0.65, -rx * 1.25, -ry * 0.6, 0, -ry);
  ctx.closePath();
  ctx.fill();

  // Subtle translucent wet edge bloom
  ctx.lineWidth = Math.max(0.6, 0.8 * scale);
  ctx.strokeStyle = colors[2];
  ctx.globalAlpha = opacity * 0.45;
  ctx.stroke();

  // Delicate center vein
  if (hasVein && ry > 6 * scale) {
    ctx.globalAlpha = opacity * 0.5;
    ctx.strokeStyle = BOTANICAL_COLORS.vein;
    ctx.lineWidth = Math.max(0.5, 0.7 * scale);
    ctx.beginPath();
    ctx.moveTo(0, -ry * 0.85);
    ctx.quadraticCurveTo(rx * 0.1, 0, 0, ry * 0.85);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draws a curving stem branch
 */
function drawStem(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  thickness: number,
  scale: number
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = BOTANICAL_COLORS.stem;
  ctx.lineWidth = Math.max(1, thickness * scale);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.globalAlpha = 0.78;

  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);

  for (let i = 1; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
  ctx.stroke();
  ctx.restore();
}

/**
 * Main function: renders the full botanical foliage overlay for 1x4 and other layouts.
 * Matches the user reference image layout with eucalyptus branches along the sides,
 * dividers between photo slots, and rich foliage surrounding the "인생네컷" footer.
 */
export function renderBotanicalDecorations(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  slots: LayoutSlot[],
  scale: number
) {
  const is1x4 = slots.length === 4 && slots[0].w > slots[0].h * 1.1;

  // Let's get slot boundaries to position leaves naturally around photo frames
  const topSlot = slots[0];
  const bottomSlot = slots[slots.length - 1];
  const slotLeft = topSlot ? topSlot.x : width * 0.08;
  const slotRight = topSlot ? topSlot.x + topSlot.w : width * 0.92;
  const slotTop = topSlot ? topSlot.y : height * 0.05;
  const slotBottom = bottomSlot ? bottomSlot.y + bottomSlot.h : height * 0.82;

  // 1. LEFT BORDER STEMS & LEAVES
  renderLeftBorderFoliage(ctx, slotLeft, slotTop, slotBottom, scale);

  // 2. RIGHT BORDER STEMS & LEAVES
  renderRightBorderFoliage(ctx, width, slotRight, slotTop, slotBottom, scale);

  // 3. HORIZONTAL DIVIDERS FOLIAGE (Between photo slots)
  if (is1x4) {
    for (let i = 0; i < slots.length - 1; i++) {
      const curr = slots[i];
      const next = slots[i + 1];
      const gapY = (curr.y + curr.h + next.y) / 2;
      renderDividerFoliage(ctx, width, gapY, slotLeft, slotRight, i, scale);
    }
  }

  // 4. TOP CORNERS FOLIAGE
  renderTopFoliage(ctx, width, slotTop, slotLeft, slotRight, scale);

  // 5. BOTTOM FOOTER FOLIAGE (Around "인생네컷")
  renderFooterFoliage(ctx, width, height, slotBottom, scale);
}

function renderLeftBorderFoliage(
  ctx: CanvasRenderingContext2D,
  slotX: number,
  topY: number,
  bottomY: number,
  scale: number
) {
  // Main vine running down left margin
  const stemPoints: { x: number; y: number }[] = [
    { x: slotX * 0.5, y: topY - 10 * scale },
    { x: slotX * 0.35, y: topY + (bottomY - topY) * 0.25 },
    { x: slotX * 0.6, y: topY + (bottomY - topY) * 0.5 },
    { x: slotX * 0.38, y: topY + (bottomY - topY) * 0.75 },
    { x: slotX * 0.55, y: bottomY + 15 * scale }
  ];
  drawStem(ctx, stemPoints, 1.4, scale);

  // Clustered leaves along the left branch
  const leafCount = 26;
  const rand = seededRandom(101);

  for (let i = 0; i < leafCount; i++) {
    const t = i / (leafCount - 1);
    const baseY = topY - 15 * scale + t * (bottomY - topY + 30 * scale);
    const side = i % 2 === 0 ? 1 : -1;
    const leafX = slotX * 0.48 + side * (slotX * 0.38 * (0.6 + rand() * 0.6));
    const leafY = baseY + (rand() - 0.5) * 16 * scale;

    const rx = (10 + rand() * 8) * scale;
    const ry = (13 + rand() * 11) * scale;
    const angle = (side > 0 ? 0.3 : -0.3) + (rand() - 0.5) * 0.9;

    const types: ('sage' | 'olive' | 'fresh' | 'deep' | 'soft')[] = ['sage', 'olive', 'fresh', 'deep', 'soft'];
    const colorType = types[Math.floor(rand() * types.length)];
    const opacity = 0.75 + rand() * 0.22;

    drawWatercolorLeaf(ctx, leafX, leafY, rx, ry, angle, colorType, opacity, scale, true);
  }
}

function renderRightBorderFoliage(
  ctx: CanvasRenderingContext2D,
  w: number,
  slotRight: number,
  topY: number,
  bottomY: number,
  scale: number
) {
  const rightMargin = w - slotRight;
  const midRight = slotRight + rightMargin * 0.52;

  const stemPoints: { x: number; y: number }[] = [
    { x: midRight + rightMargin * 0.1, y: topY - 8 * scale },
    { x: midRight - rightMargin * 0.2, y: topY + (bottomY - topY) * 0.22 },
    { x: midRight + rightMargin * 0.15, y: topY + (bottomY - topY) * 0.52 },
    { x: midRight - rightMargin * 0.25, y: topY + (bottomY - topY) * 0.78 },
    { x: midRight + rightMargin * 0.05, y: bottomY + 12 * scale }
  ];
  drawStem(ctx, stemPoints, 1.4, scale);

  const leafCount = 26;
  const rand = seededRandom(202);

  for (let i = 0; i < leafCount; i++) {
    const t = i / (leafCount - 1);
    const baseY = topY - 10 * scale + t * (bottomY - topY + 25 * scale);
    const side = i % 2 === 0 ? 1 : -1;
    const leafX = midRight + side * (rightMargin * 0.36 * (0.6 + rand() * 0.6));
    const leafY = baseY + (rand() - 0.5) * 16 * scale;

    const rx = (10 + rand() * 8) * scale;
    const ry = (13 + rand() * 11) * scale;
    const angle = (side > 0 ? 0.35 : -0.35) + (rand() - 0.5) * 0.9;

    const types: ('sage' | 'olive' | 'fresh' | 'deep' | 'soft')[] = ['sage', 'olive', 'fresh', 'deep', 'soft'];
    const colorType = types[Math.floor(rand() * types.length)];
    const opacity = 0.75 + rand() * 0.22;

    drawWatercolorLeaf(ctx, leafX, leafY, rx, ry, angle, colorType, opacity, scale, true);
  }
}

function renderDividerFoliage(
  ctx: CanvasRenderingContext2D,
  w: number,
  gapY: number,
  slotLeft: number,
  slotRight: number,
  dividerIdx: number,
  scale: number
) {
  const rand = seededRandom(303 + dividerIdx * 77);

  // Left sprig reaching across divider
  const leftSprigX = slotLeft + (10 + rand() * 18) * scale;
  const leftStem: { x: number; y: number }[] = [
    { x: slotLeft * 0.5, y: gapY + (rand() - 0.5) * 10 * scale },
    { x: slotLeft * 0.85, y: gapY + (rand() - 0.5) * 4 * scale },
    { x: leftSprigX, y: gapY + (rand() - 0.5) * 6 * scale }
  ];
  drawStem(ctx, leftStem, 1.1, scale);

  drawWatercolorLeaf(
    ctx,
    leftSprigX + 4 * scale,
    gapY + (rand() - 0.5) * 4 * scale,
    (9 + rand() * 6) * scale,
    (13 + rand() * 7) * scale,
    0.35 + rand() * 0.4,
    'olive',
    0.85,
    scale,
    true
  );

  drawWatercolorLeaf(
    ctx,
    slotLeft + 2 * scale,
    gapY - 6 * scale,
    (7 + rand() * 5) * scale,
    (10 + rand() * 6) * scale,
    -0.4 - rand() * 0.3,
    'sage',
    0.82,
    scale,
    true
  );

  // Right sprig reaching into divider
  const rightSprigX = slotRight - (10 + rand() * 18) * scale;
  const rightStem: { x: number; y: number }[] = [
    { x: slotRight + (w - slotRight) * 0.5, y: gapY + (rand() - 0.5) * 10 * scale },
    { x: slotRight + (w - slotRight) * 0.15, y: gapY + (rand() - 0.5) * 4 * scale },
    { x: rightSprigX, y: gapY + (rand() - 0.5) * 6 * scale }
  ];
  drawStem(ctx, rightStem, 1.1, scale);

  drawWatercolorLeaf(
    ctx,
    rightSprigX - 4 * scale,
    gapY + (rand() - 0.5) * 4 * scale,
    (9 + rand() * 6) * scale,
    (13 + rand() * 7) * scale,
    -0.35 - rand() * 0.4,
    'fresh',
    0.86,
    scale,
    true
  );

  drawWatercolorLeaf(
    ctx,
    slotRight - 2 * scale,
    gapY + 7 * scale,
    (8 + rand() * 5) * scale,
    (11 + rand() * 6) * scale,
    0.4 + rand() * 0.3,
    'deep',
    0.8,
    scale,
    true
  );
}

function renderTopFoliage(
  ctx: CanvasRenderingContext2D,
  w: number,
  slotTop: number,
  slotLeft: number,
  slotRight: number,
  scale: number
) {
  // Top-left arc sprig
  const tlStem: { x: number; y: number }[] = [
    { x: slotLeft * 0.3, y: slotTop + 14 * scale },
    { x: slotLeft * 0.6, y: slotTop * 0.6 },
    { x: slotLeft + 25 * scale, y: slotTop * 0.45 }
  ];
  drawStem(ctx, tlStem, 1.2, scale);

  drawWatercolorLeaf(ctx, slotLeft * 0.7, slotTop * 0.5, 9 * scale, 13 * scale, -0.6, 'sage', 0.85, scale);
  drawWatercolorLeaf(ctx, slotLeft + 15 * scale, slotTop * 0.4, 11 * scale, 15 * scale, 0.4, 'olive', 0.9, scale);
  drawWatercolorLeaf(ctx, slotLeft + 32 * scale, slotTop * 0.48, 8 * scale, 12 * scale, 0.9, 'fresh', 0.8, scale);

  // Top-right arc sprig
  const trStem: { x: number; y: number }[] = [
    { x: slotRight + (w - slotRight) * 0.7, y: slotTop + 14 * scale },
    { x: slotRight + (w - slotRight) * 0.4, y: slotTop * 0.6 },
    { x: slotRight - 25 * scale, y: slotTop * 0.45 }
  ];
  drawStem(ctx, trStem, 1.2, scale);

  drawWatercolorLeaf(
    ctx,
    slotRight + (w - slotRight) * 0.3,
    slotTop * 0.5,
    9 * scale,
    13 * scale,
    0.6,
    'deep',
    0.85,
    scale
  );
  drawWatercolorLeaf(ctx, slotRight - 15 * scale, slotTop * 0.4, 11 * scale, 15 * scale, -0.4, 'sage', 0.9, scale);
  drawWatercolorLeaf(ctx, slotRight - 32 * scale, slotTop * 0.48, 8 * scale, 12 * scale, -0.9, 'fresh', 0.8, scale);
}

function renderFooterFoliage(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  slotBottom: number,
  scale: number
) {
  const rand = seededRandom(505);
  const footerHeight = h - slotBottom;
  const footerMidY = slotBottom + footerHeight * 0.5;

  // 1. Lower border continuous floral/leaf bed
  const bottomLeafCount = 20;
  for (let i = 0; i < bottomLeafCount; i++) {
    const t = (i + 0.5) / bottomLeafCount;
    const x = t * w;
    // Keep a slight clearance in the very center for "인생네컷" text
    const isCenter = Math.abs(x - w * 0.5) < w * 0.22;
    const yOffset = isCenter ? (footerHeight * 0.32) : (footerHeight * 0.12);
    const leafY = h - 8 * scale - (rand() * 16 * scale) + yOffset;

    const rx = (10 + rand() * 8) * scale;
    const ry = (14 + rand() * 12) * scale;
    const angle = (rand() - 0.5) * 1.5;

    const types: ('sage' | 'olive' | 'fresh' | 'deep' | 'soft')[] = ['sage', 'olive', 'fresh', 'deep', 'soft'];
    const colorType = types[Math.floor(rand() * types.length)];
    const opacity = 0.7 + rand() * 0.25;

    drawWatercolorLeaf(ctx, x, leafY, rx, ry, angle, colorType, opacity, scale, true);
  }

  // 2. Left footer flourishing eucalyptus branch
  const flStem: { x: number; y: number }[] = [
    { x: w * 0.08, y: slotBottom + 10 * scale },
    { x: w * 0.16, y: footerMidY - 8 * scale },
    { x: w * 0.28, y: footerMidY + 12 * scale },
    { x: w * 0.36, y: h - 14 * scale }
  ];
  drawStem(ctx, flStem, 1.3, scale);

  const leftFooterLeaves = [
    { x: w * 0.12, y: slotBottom + 25 * scale, rx: 11, ry: 16, ang: -0.4, type: 'sage' as const },
    { x: w * 0.2, y: footerMidY - 14 * scale, rx: 13, ry: 19, ang: 0.3, type: 'olive' as const },
    { x: w * 0.24, y: footerMidY + 4 * scale, rx: 12, ry: 17, ang: -0.5, type: 'fresh' as const },
    { x: w * 0.31, y: footerMidY + 18 * scale, rx: 10, ry: 15, ang: 0.7, type: 'deep' as const }
  ];
  leftFooterLeaves.forEach((l) => {
    drawWatercolorLeaf(ctx, l.x, l.y, l.rx * scale, l.ry * scale, l.ang, l.type, 0.88, scale, true);
  });

  // 3. Right footer flourishing eucalyptus branch
  const frStem: { x: number; y: number }[] = [
    { x: w * 0.92, y: slotBottom + 10 * scale },
    { x: w * 0.84, y: footerMidY - 8 * scale },
    { x: w * 0.72, y: footerMidY + 12 * scale },
    { x: w * 0.64, y: h - 14 * scale }
  ];
  drawStem(ctx, frStem, 1.3, scale);

  const rightFooterLeaves = [
    { x: w * 0.88, y: slotBottom + 25 * scale, rx: 11, ry: 16, ang: 0.4, type: 'deep' as const },
    { x: w * 0.8, y: footerMidY - 14 * scale, rx: 13, ry: 19, ang: -0.3, type: 'sage' as const },
    { x: w * 0.76, y: footerMidY + 4 * scale, rx: 12, ry: 17, ang: 0.5, type: 'fresh' as const },
    { x: w * 0.69, y: footerMidY + 18 * scale, rx: 10, ry: 15, ang: -0.7, type: 'olive' as const }
  ];
  rightFooterLeaves.forEach((l) => {
    drawWatercolorLeaf(ctx, l.x, l.y, l.rx * scale, l.ry * scale, l.ang, l.type, 0.88, scale, true);
  });
}
