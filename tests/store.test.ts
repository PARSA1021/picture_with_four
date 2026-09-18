import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../src/state/store.ts';

describe('FrameStore', () => {
  beforeEach(() => {
    store.fullReset();
  });

  it('initializes with default config', () => {
    const config = store.getConfig();
    expect(config.layout).toBe('1x4');
    expect(config.theme).toBe('modern-black');
    expect(config.images).toHaveLength(0);
    expect(config.frameMargin).toBe(4);
  });

  it('updates layout and notifies subscribers', () => {
    let notified = false;
    const unsubscribe = store.subscribe(() => {
      notified = true;
    });

    store.setLayout('2x2');
    expect(store.getConfig().layout).toBe('2x2');
    expect(notified).toBe(true);

    unsubscribe();
  });

  it('applies theme and updates colors', () => {
    store.setTheme('clean-white');
    const config = store.getConfig();
    expect(config.theme).toBe('clean-white');
    expect(config.backgroundColor).toBe('#ffffff');

    store.setTheme('sunset-lavender');
    const lavenderConfig = store.getConfig();
    expect(lavenderConfig.theme).toBe('sunset-lavender');
    expect(lavenderConfig.backgroundColor).toBe('#4c1d95');
    expect(lavenderConfig.mainText.color).toBe('#ffffff');
  });

  it('applies frame preset properly', () => {
    store.setFramePreset('polaroid');
    const config = store.getConfig();
    expect(config.preset).toBe('polaroid');
    expect(config.frameMargin).toBe(6);
    expect(config.imagePadding).toBe(4);
    expect(config.imageCornerRadius).toBe(0);
  });

  it('clamps sliders to valid boundaries', () => {
    store.setFrameMargin(30); // max is 20
    expect(store.getConfig().frameMargin).toBe(20);

    store.setFrameMargin(-5); // min is 0
    expect(store.getConfig().frameMargin).toBe(0);

    store.setImageCornerRadius(100); // max is 50
    expect(store.getConfig().imageCornerRadius).toBe(50);
  });

  it('updates main and sub text configs and effects', () => {
    store.updateMainText({ content: 'MY FOUR CUTS', size: 58 });
    expect(store.getConfig().mainText.content).toBe('MY FOUR CUTS');
    expect(store.getConfig().mainText.size).toBe(58);

    store.setTextEffect('mainText', 'sticker-outline');
    expect(store.getConfig().mainText.effect).toBe('sticker-outline');
    expect(store.getConfig().mainText.strokeWidth).toBeGreaterThan(0);

    store.updateSubText({ content: '2026. 09. 16' });
    expect(store.getConfig().subText.content).toBe('2026. 09. 16');
  });

  it('swaps and shuffles images correctly', () => {
    const mockImages = [
      { id: '1', src: 'img1', rotation: 0, flipped: false, zoom: 100, offsetX: 0, offsetY: 0, filter: null, image: {} as HTMLImageElement },
      { id: '2', src: 'img2', rotation: 0, flipped: false, zoom: 100, offsetX: 0, offsetY: 0, filter: null, image: {} as HTMLImageElement },
      { id: '3', src: 'img3', rotation: 0, flipped: false, zoom: 100, offsetX: 0, offsetY: 0, filter: null, image: {} as HTMLImageElement },
      { id: '4', src: 'img4', rotation: 0, flipped: false, zoom: 100, offsetX: 0, offsetY: 0, filter: null, image: {} as HTMLImageElement }
    ];

    store.addImages(mockImages);
    expect(store.getConfig().images).toHaveLength(4);

    // Test swap
    store.swapImages(0, 3);
    expect(store.getConfig().images[0].id).toBe('4');
    expect(store.getConfig().images[3].id).toBe('1');

    // Test shuffle maintains same length and set of items
    store.shuffleImages();
    expect(store.getConfig().images).toHaveLength(4);
    const ids = store.getConfig().images.map((img) => img.id);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).toContain('3');
    expect(ids).toContain('4');
  });
});
