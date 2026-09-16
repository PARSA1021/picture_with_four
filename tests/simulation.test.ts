import { beforeEach, describe, expect, it } from 'vitest';
import { STICKER_PALETTE } from '../src/core/constants.ts';
import { calculateLayoutSlots } from '../src/core/layout-engine.ts';
import { store } from '../src/state/store.ts';

describe('PIC4U User Simulation & E2E Workflow Test', () => {
  beforeEach(() => {
    store.fullReset();
  });

  it('Simulation 1: Onboarding - initializes with PIC4U branding', () => {
    const config = store.getConfig();
    expect(config.mainText.content).toBe('PIC4U STUDIO');
    expect(config.theme).toBe('modern-black');
    expect(config.preset).toBe('classic-slim');
    expect(STICKER_PALETTE).toContain('❤️');
    expect(STICKER_PALETTE).toContain('✨');
  });

  it('Simulation 2: User customizes styling with 1-click presets', () => {
    // 1. Change layout from 1x4 to 2x2
    store.setLayout('2x2');
    expect(store.getConfig().layout).toBe('2x2');

    // 2. Change frame preset to polaroid
    store.setFramePreset('polaroid');
    expect(store.getConfig().preset).toBe('polaroid');
    expect(store.getConfig().frameMargin).toBe(6);

    // 3. Change theme to warm-beige
    store.setTheme('warm-beige');
    expect(store.getConfig().theme).toBe('warm-beige');
    expect(store.getConfig().backgroundColor).toBe('#fdfbf7');
  });

  it('Simulation 3: User attaches stickers to customize frame', () => {
    expect(store.getConfig().stickers).toHaveLength(0);

    // Add heart and sparkle
    store.addSticker('❤️');
    store.addSticker('✨');
    expect(store.getConfig().stickers).toHaveLength(2);

    const heart = store.getConfig().stickers[0];
    expect(heart.emoji).toBe('❤️');

    // User drags sticker to a new location
    store.updateSticker(heart.id, { x: 0.85, y: 0.12 });
    expect(store.getConfig().stickers[0].x).toBe(0.85);
    expect(store.getConfig().stickers[0].y).toBe(0.12);

    // User deletes one sticker
    store.removeSticker(heart.id);
    expect(store.getConfig().stickers).toHaveLength(1);
    expect(store.getConfig().stickers[0].emoji).toBe('✨');

    // User clears all stickers
    store.clearStickers();
    expect(store.getConfig().stickers).toHaveLength(0);
  });

  it('Simulation 4: User customizes text title and date effect', () => {
    store.updateMainText({ content: 'PIC4U WITH YOU', size: 58 });
    expect(store.getConfig().mainText.content).toBe('PIC4U WITH YOU');
    expect(store.getConfig().mainText.size).toBe(58);

    // Switch to sticker outline effect
    store.setTextEffect('mainText', 'sticker-outline');
    expect(store.getConfig().mainText.effect).toBe('sticker-outline');
    expect(store.getConfig().mainText.strokeWidth).toBe(3);

    // Switch to soft shadow effect
    store.setTextEffect('mainText', 'soft-shadow');
    expect(store.getConfig().mainText.effect).toBe('soft-shadow');

    store.updateSubText({ content: '2026. 09. 16' });
    expect(store.getConfig().subText.content).toBe('2026. 09. 16');
  });

  it('Simulation 5: Slot swap and direct target upload', () => {
    // Simulate setting a target upload slot
    store.targetUploadSlotIndex = 2;
    expect(store.targetUploadSlotIndex).toBe(2);

    // Simulate selecting slot for rotation/flip
    store.setSelectedSlot(1);
    expect(store.selectedSlotIndex).toBe(1);

    store.setSelectedSlot(null);
    expect(store.selectedSlotIndex).toBeNull();
  });

  it('Simulation 6: Layout calculations preserve valid coordinates across all viewports', () => {
    const viewports = [
      { w: 320, h: 928 },  // Mobile small (aspect 2.9)
      { w: 390, h: 1131 }, // Mobile standard
      { w: 768, h: 983 },  // Tablet 2x2 (aspect 1.28)
      { w: 1200, h: 3480 } // High-res export
    ];

    viewports.forEach((vp) => {
      const slots = calculateLayoutSlots('1x4', vp.w, vp.h, {
        marginPx: vp.w * 0.04,
        paddingPx: vp.w * 0.03
      });

      expect(slots).toHaveLength(4);
      slots.forEach((s) => {
        expect(s.x).toBeGreaterThanOrEqual(0);
        expect(s.y).toBeGreaterThanOrEqual(0);
        expect(s.w).toBeGreaterThan(0);
        expect(s.h).toBeGreaterThan(0);
        expect(s.x + s.w).toBeLessThanOrEqual(vp.w);
      });
    });
  });
});
