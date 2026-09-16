import { LayoutSlot, LayoutType } from '../state/types.ts';
import { LAYOUTS } from './constants.ts';

export interface LayoutOptions {
  marginPx: number;
  paddingPx: number;
  footerHeightPx?: number;
}

/**
 * Calculates slot coordinates and dimensions for the given layout.
 * Accurately handles footer space for title/date overlays.
 */
export function calculateLayoutSlots(
  layout: LayoutType,
  width: number,
  height: number,
  options: LayoutOptions
): LayoutSlot[] {
  const { marginPx, paddingPx } = options;
  const footerHeight = options.footerHeightPx ?? height * 0.10;

  const fx = marginPx;
  const fy = marginPx;
  const fw = Math.max(10, width - marginPx * 2);
  const usableH = Math.max(10, height - marginPx * 2 - footerHeight);

  const slots: LayoutSlot[] = [];
  const addSlot = (idx: number, x: number, y: number, w: number, h: number) => {
    slots.push({
      index: idx,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      w: Math.round(w * 10) / 10,
      h: Math.round(h * 10) / 10
    });
  };

  switch (layout) {
    case '1x4': {
      const h = Math.max(10, (usableH - paddingPx * 3) / 4);
      for (let i = 0; i < 4; i++) {
        addSlot(i, fx, fy + i * (h + paddingPx), fw, h);
      }
      break;
    }

    case '2x2': {
      const w = Math.max(10, (fw - paddingPx) / 2);
      const h = Math.max(10, (usableH - paddingPx) / 2);
      addSlot(0, fx, fy, w, h);
      addSlot(1, fx + w + paddingPx, fy, w, h);
      addSlot(2, fx, fy + h + paddingPx, w, h);
      addSlot(3, fx + w + paddingPx, fy + h + paddingPx, w, h);
      break;
    }

    case '1+3': {
      const bigH = Math.max(10, usableH * 0.60);
      const smallH = Math.max(10, usableH - bigH - paddingPx);
      const smallW = Math.max(10, (fw - paddingPx * 2) / 3);

      addSlot(0, fx, fy, fw, bigH);
      for (let i = 0; i < 3; i++) {
        addSlot(i + 1, fx + i * (smallW + paddingPx), fy + bigH + paddingPx, smallW, smallH);
      }
      break;
    }

    case '2x3': {
      const w = Math.max(10, (fw - paddingPx) / 2);
      const h = Math.max(10, (usableH - paddingPx * 2) / 3);
      for (let i = 0; i < 6; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        addSlot(i, fx + col * (w + paddingPx), fy + row * (h + paddingPx), w, h);
      }
      break;
    }

    case '3x2': {
      const w = Math.max(10, (fw - paddingPx * 2) / 3);
      const h = Math.max(10, (usableH - paddingPx) / 2);
      for (let i = 0; i < 6; i++) {
        const row = Math.floor(i / 3);
        const col = i % 3;
        addSlot(i, fx + col * (w + paddingPx), fy + row * (h + paddingPx), w, h);
      }
      break;
    }
  }

  return slots;
}

/**
 * Returns the recommended aspect ratio (height / width) for the layout.
 */
export function getLayoutAspectRatio(layout: LayoutType): number {
  const meta = LAYOUTS.find((l) => l.id === layout);
  return meta ? meta.aspectRatio : 1.5;
}

/**
 * Returns maximum photos supported by the layout.
 */
export function getLayoutSlotCount(layout: LayoutType): number {
  const meta = LAYOUTS.find((l) => l.id === layout);
  return meta ? meta.count : 4;
}
