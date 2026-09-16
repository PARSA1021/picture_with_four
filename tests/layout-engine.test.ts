import { describe, expect, it } from 'vitest';
import {
  calculateLayoutSlots,
  getLayoutAspectRatio,
  getLayoutSlotCount
} from '../src/core/layout-engine.ts';

describe('Layout Engine', () => {
  const defaultOptions = {
    marginPx: 20,
    paddingPx: 16,
    footerHeightPx: 100
  };

  it('calculates 1x4 layout slots correctly', () => {
    const width = 400;
    const height = 1160;
    const slots = calculateLayoutSlots('1x4', width, height, defaultOptions);

    expect(slots).toHaveLength(4);
    expect(slots[0].w).toBe(width - defaultOptions.marginPx * 2);
    expect(slots[0].x).toBe(defaultOptions.marginPx);
    expect(slots[0].y).toBe(defaultOptions.marginPx);

    // Verify slots are vertically ordered and non-overlapping
    for (let i = 1; i < 4; i++) {
      expect(slots[i].y).toBeGreaterThan(slots[i - 1].y);
      expect(slots[i].y).toBeGreaterThanOrEqual(slots[i - 1].y + slots[i - 1].h);
    }
  });

  it('calculates 2x2 layout slots correctly', () => {
    const width = 400;
    const height = 520;
    const slots = calculateLayoutSlots('2x2', width, height, defaultOptions);

    expect(slots).toHaveLength(4);
    // Row 0
    expect(slots[0].y).toBe(slots[1].y);
    expect(slots[1].x).toBeGreaterThan(slots[0].x);

    // Row 1
    expect(slots[2].y).toBe(slots[3].y);
    expect(slots[2].y).toBeGreaterThan(slots[0].y);
    expect(slots[3].x).toBeGreaterThan(slots[2].x);
  });

  it('calculates 1+3 layout slots correctly with hero slot', () => {
    const width = 400;
    const height = 720;
    const slots = calculateLayoutSlots('1+3', width, height, defaultOptions);

    expect(slots).toHaveLength(4);
    // Slot 0 is hero slot (wider than others)
    expect(slots[0].w).toBeGreaterThan(slots[1].w);
    // Slots 1, 2, 3 are in a row beneath slot 0
    expect(slots[1].y).toBe(slots[2].y);
    expect(slots[2].y).toBe(slots[3].y);
    expect(slots[1].y).toBeGreaterThan(slots[0].y);
  });

  it('calculates 2x3 and 3x2 layouts correctly with 6 slots', () => {
    const slots2x3 = calculateLayoutSlots('2x3', 400, 640, defaultOptions);
    expect(slots2x3).toHaveLength(6);

    const slots3x2 = calculateLayoutSlots('3x2', 400, 500, defaultOptions);
    expect(slots3x2).toHaveLength(6);
  });

  it('returns valid aspect ratios for all layouts', () => {
    expect(getLayoutAspectRatio('1x4')).toBeGreaterThan(2.0);
    expect(getLayoutAspectRatio('2x2')).toBeGreaterThan(1.0);
    expect(getLayoutAspectRatio('1+3')).toBeGreaterThan(1.5);
    expect(getLayoutAspectRatio('2x3')).toBeGreaterThan(1.2);
    expect(getLayoutAspectRatio('3x2')).toBeGreaterThan(1.0);
  });

  it('returns valid slot counts', () => {
    expect(getLayoutSlotCount('1x4')).toBe(4);
    expect(getLayoutSlotCount('2x2')).toBe(4);
    expect(getLayoutSlotCount('1+3')).toBe(4);
    expect(getLayoutSlotCount('2x3')).toBe(6);
    expect(getLayoutSlotCount('3x2')).toBe(6);
  });
});
