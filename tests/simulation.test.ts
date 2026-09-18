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

  it('Simulation 7: Botanical Eucalyptus Theme - applies PIC4U brand typography and watercolor palette', () => {
    // Switch to botanical-eucalyptus
    store.setTheme('botanical-eucalyptus');

    const config = store.getConfig();
    expect(config.theme).toBe('botanical-eucalyptus');
    expect(config.layout).toBe('1x4');
    expect(config.mainText.content).toBe('PIC4U STUDIO');
    expect(config.mainText.color).toBe('#ffffff');
    expect(config.mainText.effect).toBe('soft-shadow');
    expect(config.frameColor).toBe('#f9f9f5');
    expect(config.backgroundColor).toBe('#3e563b');
  });

  it('Simulation 8: Romantic Pink Rose Theme - applies PIC4U brand typography and rose palette', () => {
    // Switch to romantic-rose
    store.setTheme('romantic-rose');

    const config = store.getConfig();
    expect(config.theme).toBe('romantic-rose');
    expect(config.layout).toBe('1x4');
    expect(config.mainText.content).toBe('PIC4U STUDIO');
    expect(config.mainText.color).toBe('#ffffff');
    expect(config.mainText.effect).toBe('soft-shadow');
    expect(config.frameColor).toBe('#fcebee');
    expect(config.backgroundColor).toBe('#f8a199');
  });

  it('Simulation 9: Sky Cloud Theme - applies PIC4U brand typography and blue sky cloud palette', () => {
    // Switch to sky-cloud
    store.setTheme('sky-cloud');

    const config = store.getConfig();
    expect(config.theme).toBe('sky-cloud');
    expect(config.layout).toBe('1x4');
    expect(config.mainText.content).toBe('PIC4U STUDIO');
    expect(config.mainText.color).toBe('#ffffff');
    expect(config.mainText.effect).toBe('soft-shadow');
    expect(config.frameColor).toBe('#e8f4fc');
    expect(config.backgroundColor).toBe('#38bdf8');
  });

  it('Simulation 10: Preserves custom text and allows complete text removal', () => {
    // 1. User enters custom couple title
    store.updateMainText({ content: '성민❤️기영' });
    store.updateSubText({ content: '2026. 09. 16' });

    // Switching theme preserves the user's custom text
    store.setTheme('sky-cloud');
    expect(store.getConfig().mainText.content).toBe('성민❤️기영');
    expect(store.getConfig().subText.content).toBe('2026. 09. 16');

    // 2. User removes text (blank frame mode)
    store.updateMainText({ content: '' });
    store.updateSubText({ content: '' });
    expect(store.getConfig().mainText.content).toBe('');
    expect(store.getConfig().subText.content).toBe('');

    // Switching theme still keeps it empty!
    store.setTheme('romantic-rose');
    expect(store.getConfig().mainText.content).toBe('');
    expect(store.getConfig().subText.content).toBe('');
  });

  it('Simulation 11: Signature #4 Pastel Impasto Oil Painting Theme defaults and behavior', () => {
    store.setTheme('pastel-oil');
    const config = store.getConfig();

    expect(config.theme).toBe('pastel-oil');
    expect(config.layout).toBe('1x4');
    expect(config.mainText.content).toBe('PIC4U STUDIO');
    expect(config.mainText.color).toBe('#ffffff');
    expect(config.mainText.effect).toBe('soft-shadow');
    expect(config.frameColor).toBe('#f5eefb');
    expect(config.backgroundColor).toBe('#d8cde8');
  });

  it('Simulation 12: Signature #5 Sunshine Yellow Rose & Flowers Theme defaults and behavior', () => {
    store.setTheme('yellow-rose');
    const config = store.getConfig();

    expect(config.theme).toBe('yellow-rose');
    expect(config.layout).toBe('1x4');
    expect(config.mainText.content).toBe('PIC4U STUDIO');
    expect(config.mainText.color).toBe('#ffffff');
    expect(config.mainText.effect).toBe('soft-shadow');
    expect(config.frameColor).toBe('#fefce8');
    expect(config.backgroundColor).toBe('#fef08a');
  });

  it('Simulation 13: Signature #6 Midnight Aurora & Starry Sky Theme defaults and behavior', () => {
    store.setTheme('midnight-aurora');
    const config = store.getConfig();

    expect(config.theme).toBe('midnight-aurora');
    expect(config.layout).toBe('1x4');
    expect(config.mainText.content).toBe('PIC4U STUDIO');
    expect(config.mainText.color).toBe('#ffffff');
    expect(config.mainText.effect).toBe('soft-shadow');
    expect(config.frameColor).toBe('#080d1a');
    expect(config.backgroundColor).toBe('#0b0f19');
  });

  it('Simulation 14: Signature #7 Spring Cherry Blossom Theme defaults and behavior', () => {
    store.setTheme('spring-cherry');
    const config = store.getConfig();

    expect(config.theme).toBe('spring-cherry');
    expect(config.layout).toBe('1x4');
    expect(config.mainText.content).toBe('PIC4U STUDIO');
    expect(config.mainText.color).toBe('#ffffff');
    expect(config.mainText.effect).toBe('soft-shadow');
    expect(config.frameColor).toBe('#fff5f7');
    expect(config.backgroundColor).toBe('#fdf2f4');
  });
});
