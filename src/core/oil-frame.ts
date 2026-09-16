import { LayoutSlot } from '../state/types.ts';

/**
 * Pastel Impasto Oil Painting Drawing Engine (#4 유화 프레임)
 * Specifically designed for PIC4U signature Oil Painting Edition.
 */

const OIL_PALETTE = {
  // Rich blended pastel oil colors from reference photo
  lilacDark: '#7e57c2',
  lilacMid: '#9575cd',
  lilacLight: '#b39ddb',
  lilacSoft: '#d1c4e9',
  lilacPastel: '#ede7f6',

  roseDeep: '#ec407a',
  roseMid: '#f06292',
  roseLight: '#f48fb1',
  roseSoft: '#f8bbd0',

  mintDeep: '#00acc1',
  mintMid: '#26c6da',
  mintLight: '#4dd0e1',
  mintSoft: '#80deea',
  mintIce: '#e0f7fa',

  butterCream: '#fff8e1',
  pearlWhite: '#ffffff',

  shadowDark: 'rgba(50, 20, 70, 0.35)',
  shadowSoft: 'rgba(70, 30, 90, 0.18)',
  highlight: 'rgba(255, 255, 255, 0.75)'
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
 * Draws the rich impasto oil painting textured canvas background
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

  // 1. Base luminous pastel gradient (Lavender to Soft Rose & Mint)
  const baseGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  baseGrad.addColorStop(0, '#e8dff5');
  baseGrad.addColorStop(0.35, '#fce4ec');
  baseGrad.addColorStop(0.7, '#e0f7fa');
  baseGrad.addColorStop(1, '#ede7f6');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(x, y, w, h);

  // 2. Subtle artist canvas linen weave texture
  const rand = seededRandom(404);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  const weaveCount = Math.min(500, Math.round(w * h * 0.0003));
  for (let i = 0; i < weaveCount; i++) {
    const wx = x + rand() * w;
    const wy = y + rand() * h;
    const ww = (2 + rand() * 4) * scale;
    const wh = (1 + rand() * 2) * scale;
    ctx.fillRect(wx, wy, ww, wh);
  }

  // 3. Sweeping Palette Knife Strokes across the card background
  const strokeCount = 45;
  const colors = [
    OIL_PALETTE.lilacLight,
    OIL_PALETTE.lilacMid,
    OIL_PALETTE.roseLight,
    OIL_PALETTE.roseMid,
    OIL_PALETTE.mintLight,
    OIL_PALETTE.mintMid,
    OIL_PALETTE.lilacSoft,
    OIL_PALETTE.butterCream
  ];

  for (let i = 0; i < strokeCount; i++) {
    const sx = x + rand() * w;
    const sy = y + rand() * h;
    const sw = (50 + rand() * 120) * scale;
    const sh = (14 + rand() * 28) * scale;
    const angle = (rand() - 0.5) * 1.1 + (i % 2 === 0 ? 0.35 : -0.35);
    const color = colors[i % colors.length];

    drawPaletteKnifeStroke(ctx, sx, sy, sw, sh, angle, color, scale, 0.35 + rand() * 0.45);
  }

  ctx.restore();
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
  alpha: number = 0.8
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  ctx.globalAlpha = alpha;

  // 1. Under-stroke soft paint shadow (giving thickness to the paint layer)
  ctx.shadowColor = OIL_PALETTE.shadowSoft;
  ctx.shadowBlur = 4 * scale;
  ctx.shadowOffsetY = 2 * scale;

  // 2. Main paint stroke body (curved thick smear)
  ctx.beginPath();
  ctx.moveTo(-length * 0.5, -width * 0.3);
  ctx.bezierCurveTo(
    -length * 0.2,
    -width * 0.6,
    length * 0.2,
    -width * 0.5,
    length * 0.5,
    -width * 0.2
  );
  ctx.bezierCurveTo(
    length * 0.45,
    width * 0.4,
    -length * 0.1,
    width * 0.6,
    -length * 0.5,
    width * 0.3
  );
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();

  // Reset shadow for fine highlights
  ctx.shadowColor = 'transparent';

  // 3. Crisp palette knife ridge highlight along top bevel
  ctx.beginPath();
  ctx.moveTo(-length * 0.45, -width * 0.25);
  ctx.bezierCurveTo(
    -length * 0.15,
    -width * 0.55,
    length * 0.15,
    -width * 0.45,
    length * 0.42,
    -width * 0.18
  );
  ctx.strokeStyle = OIL_PALETTE.highlight;
  ctx.lineWidth = Math.max(0.8, 1.2 * scale);
  ctx.stroke();

  // 4. Subtle inner color variation streak
  ctx.beginPath();
  ctx.moveTo(-length * 0.3, 0);
  ctx.lineTo(length * 0.3, 0);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = Math.max(0.6, 1.0 * scale);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draws a dimensional 3D oil paint teardrop/dollop peeking over the frame edge
 * (Matching the lilac and pink drops on the borders in the reference photo!)
 */
function drawPaintDollop(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  sizeX: number,
  sizeY: number,
  angle: number,
  baseColor: string,
  deepColor: string,
  scale: number
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // 1. Cast shadow of the thick paint dollop
  ctx.shadowColor = OIL_PALETTE.shadowDark;
  ctx.shadowBlur = 8 * scale;
  ctx.shadowOffsetX = 3 * scale;
  ctx.shadowOffsetY = 4 * scale;

  // 2. Volumetric teardrop/petal shape
  ctx.beginPath();
  ctx.moveTo(0, -sizeY * 0.5);
  ctx.bezierCurveTo(
    sizeX * 0.6,
    -sizeY * 0.3,
    sizeX * 0.65,
    sizeY * 0.25,
    0,
    sizeY * 0.55
  );
  ctx.bezierCurveTo(
    -sizeX * 0.65,
    sizeY * 0.25,
    -sizeX * 0.6,
    -sizeY * 0.3,
    0,
    -sizeY * 0.5
  );
  ctx.closePath();

  const dollopGrad = ctx.createRadialGradient(
    -sizeX * 0.15,
    -sizeY * 0.15,
    sizeX * 0.05,
    0,
    0,
    sizeX * 0.65
  );
  dollopGrad.addColorStop(0, '#ffffff');
  dollopGrad.addColorStop(0.3, baseColor);
  dollopGrad.addColorStop(0.85, deepColor);
  dollopGrad.addColorStop(1, deepColor);

  ctx.fillStyle = dollopGrad;
  ctx.fill();

  // Reset shadow for glossy shine
  ctx.shadowColor = 'transparent';

  // 3. Specular gloss highlight crescent on the dome
  ctx.beginPath();
  ctx.ellipse(
    -sizeX * 0.18,
    -sizeY * 0.15,
    sizeX * 0.22,
    sizeY * 0.14,
    -Math.PI / 4,
    0,
    Math.PI * 2
  );
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.fill();

  // 4. Subtle secondary rim reflection
  ctx.beginPath();
  ctx.arc(sizeX * 0.2, sizeY * 0.2, sizeX * 0.1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.fill();

  ctx.restore();
}

/**
 * Main foreground decorator: renders the 3D paint dollops, divider palette knife strokes,
 * and the rich impasto swirl in the footer around the brand text.
 */
export function renderOilDecorations(
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
  const slotBottom = bottomSlot ? bottomSlot.y + bottomSlot.h : height * 0.82;

  // 1. DIVIDER IMPASTO STROKES (Between slots)
  if (is1x4) {
    for (let i = 0; i < slots.length - 1; i++) {
      const curr = slots[i];
      const next = slots[i + 1];
      const gapY = (curr.y + curr.h + next.y) / 2;

      // Turquoise & Lilac smear in gutter
      drawPaletteKnifeStroke(
        ctx,
        width * 0.45,
        gapY,
        width * 0.65,
        12 * scale,
        0.05,
        i % 2 === 0 ? OIL_PALETTE.mintMid : OIL_PALETTE.lilacMid,
        scale,
        0.85
      );

      drawPaletteKnifeStroke(
        ctx,
        width * 0.58,
        gapY + 1 * scale,
        width * 0.5,
        9 * scale,
        -0.08,
        i % 2 === 0 ? OIL_PALETTE.roseLight : OIL_PALETTE.mintLight,
        scale,
        0.75
      );
    }
  }

  // 2. SIGNATURE 3D PAINT DOLLOPS (From reference photo!)
  // Dollop 1: Distinct Lilac/Purple 3D drop on the right side of Slot 2
  if (slots.length >= 2) {
    const s2 = slots[1];
    const dropY = s2.y + s2.h * 0.72;
    drawPaintDollop(
      ctx,
      slotRight + 2 * scale,
      dropY,
      22 * scale,
      32 * scale,
      0.25,
      OIL_PALETTE.lilacMid,
      OIL_PALETTE.lilacDark,
      scale
    );
  }

  // Dollop 2: Soft Rosy-Pink 3D drop on the left side of Slot 3
  if (slots.length >= 3) {
    const s3 = slots[2];
    const dropY = s3.y + s3.h * 0.78;
    drawPaintDollop(
      ctx,
      slotLeft - 2 * scale,
      dropY,
      20 * scale,
      30 * scale,
      -0.35,
      OIL_PALETTE.roseMid,
      OIL_PALETTE.roseDeep,
      scale
    );
  }

  // Dollop 3: Small Lilac droplet at top-right of Slot 1
  if (slots.length >= 1) {
    const s1 = slots[0];
    drawPaintDollop(
      ctx,
      slotRight + 3 * scale,
      s1.y + s1.h * 0.2,
      16 * scale,
      24 * scale,
      0.15,
      OIL_PALETTE.lilacLight,
      OIL_PALETTE.lilacMid,
      scale
    );
  }

  // 3. FOOTER IMPASTO PALETTE KNIFE SWIRL
  // Creates the marbleized oil painting swirl around the footer brand title
  renderFooterOilSwirl(ctx, width, height, slotBottom, scale);
}

/**
 * Draws the expressive palette knife oil swirl in the footer
 */
function renderFooterOilSwirl(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  slotBottom: number,
  scale: number
) {
  const footerH = h - slotBottom;
  const footerMidY = slotBottom + footerH * 0.58;

  // Swirling sweeping strokes across the bottom
  // 1. Turquoise ocean sweep
  drawPaletteKnifeStroke(
    ctx,
    w * 0.65,
    footerMidY + 12 * scale,
    w * 0.75,
    26 * scale,
    -0.12,
    OIL_PALETTE.mintMid,
    scale,
    0.9
  );

  // 2. Soft lilac violet sweep
  drawPaletteKnifeStroke(
    ctx,
    w * 0.32,
    footerMidY + 18 * scale,
    w * 0.68,
    28 * scale,
    0.15,
    OIL_PALETTE.lilacMid,
    scale,
    0.92
  );

  // 3. Rose blush accent streak
  drawPaletteKnifeStroke(
    ctx,
    w * 0.5,
    footerMidY + 6 * scale,
    w * 0.6,
    18 * scale,
    -0.05,
    OIL_PALETTE.roseLight,
    scale,
    0.85
  );

  // 4. Cream & Pearl highlight ribbon
  drawPaletteKnifeStroke(
    ctx,
    w * 0.42,
    footerMidY - 2 * scale,
    w * 0.48,
    12 * scale,
    0.08,
    OIL_PALETTE.butterCream,
    scale,
    0.7
  );

  // 5. Rich purple paint dollop accent at bottom-left corner
  drawPaintDollop(
    ctx,
    w * 0.16,
    footerMidY + 22 * scale,
    24 * scale,
    34 * scale,
    0.3,
    OIL_PALETTE.lilacMid,
    OIL_PALETTE.lilacDark,
    scale
  );

  // 6. Turquoise dollop at bottom-right corner
  drawPaintDollop(
    ctx,
    w * 0.86,
    footerMidY + 20 * scale,
    22 * scale,
    30 * scale,
    -0.25,
    OIL_PALETTE.mintMid,
    OIL_PALETTE.mintDeep,
    scale
  );
}
