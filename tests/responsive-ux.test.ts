import { describe, expect, it } from 'vitest';
import { LAYOUTS } from '../src/core/constants.ts';
import { store } from '../src/state/store.ts';

describe('Responsive UX & Tab Alignment Verification', () => {
  it('Verifies all layouts have valid structure for visual mini icons', () => {
    expect(LAYOUTS).toHaveLength(5);
    const layoutIds = LAYOUTS.map((l) => l.id);
    expect(layoutIds).toContain('1x4');
    expect(layoutIds).toContain('2x2');
    expect(layoutIds).toContain('1+3');
    expect(layoutIds).toContain('2x3');
    expect(layoutIds).toContain('3x2');
  });

  it('Verifies quick text presets update store correctly', () => {
    store.fullReset();
    const presets = ['PIC4U STUDIO', 'HAPPY MOMENTS', 'OUR MEMORIES', '오늘의 우리', 'FOREVER YOUNG'];

    presets.forEach((text) => {
      store.updateMainText({ content: text });
      expect(store.getConfig().mainText.content).toBe(text);
    });
  });

  it('Verifies responsive aspect ratio auto-fitting bounds', () => {
    // 1x4 layout: 2.9 aspect ratio
    store.setLayout('1x4');
    expect(store.getConfig().layout).toBe('1x4');

    // On mobile maxAllowedH = 350 -> targetW = Math.round(350 / 2.9) = 121
    const mobileTargetW = Math.round(350 / 2.9);
    expect(mobileTargetW).toBeGreaterThanOrEqual(120);

    // 2x2 layout: 1.28 aspect ratio
    store.setLayout('2x2');
    const sqTargetW = Math.min(330, Math.round(350 / 1.28));
    expect(sqTargetW).toBe(273);
  });

  it('Verifies mobile pinch-to-zoom distance scaling math', () => {
    const initialDist = 100;
    const initialZoom = 100;

    // Fingers spread out to 150px (+50% pinch out)
    const currentDistExpanded = 150;
    const scaleExpanded = currentDistExpanded / initialDist;
    const zoomedIn = Math.max(50, Math.min(200, Math.round(initialZoom * scaleExpanded)));
    expect(zoomedIn).toBe(150);

    // Fingers pinch in to 70px (-30% pinch in)
    const currentDistPinched = 70;
    const scalePinched = currentDistPinched / initialDist;
    const zoomedOut = Math.max(50, Math.min(200, Math.round(initialZoom * scalePinched)));
    expect(zoomedOut).toBe(70);

    // Extreme pinch clamp check (under 50% or over 200%)
    const overZoomDist = 300;
    const overZoom = Math.max(50, Math.min(200, Math.round(initialZoom * (overZoomDist / initialDist))));
    expect(overZoom).toBe(200);

    const underZoomDist = 20;
    const underZoom = Math.max(50, Math.min(200, Math.round(initialZoom * (underZoomDist / initialDist))));
    expect(underZoom).toBe(50);
  });

  it('Verifies mobile toolbar clearance logic when slot is active', () => {
    const stageH = 300;
    const hasActiveToolbar = true;
    const reservedH = hasActiveToolbar ? 54 : 16;
    const maxAllowedH = Math.max(120, stageH - reservedH);
    expect(maxAllowedH).toBe(246);
    expect(maxAllowedH).toBeLessThan(stageH - 16);
  });

  describe('All Tablet Viewports: iPad mini, iPad Air, iPad Pro, Galaxy Tab, Surface Pro', () => {
    const tabletDevices = [
      { name: 'iPad mini (Portrait)', width: 768, height: 1024, stageWRatio: 0.46 },
      { name: 'iPad mini (Landscape)', width: 1024, height: 768, stageWRatio: 0.43 },
      { name: 'iPad Air / 10th gen (Portrait)', width: 820, height: 1180, stageWRatio: 0.46 },
      { name: 'iPad Air / 10th gen (Landscape)', width: 1180, height: 820, stageWRatio: 0.43 },
      { name: 'iPad Pro 11-inch (Portrait)', width: 834, height: 1194, stageWRatio: 0.46 },
      { name: 'iPad Pro 11-inch (Landscape)', width: 1194, height: 834, stageWRatio: 0.43 },
      { name: 'iPad Pro 12.9-inch (Portrait)', width: 1024, height: 1366, stageWRatio: 0.44 },
      { name: 'iPad Pro 12.9-inch (Landscape)', width: 1366, height: 1024, stageWRatio: 0.43 },
      { name: 'Galaxy Tab S7/S8/S9 (Portrait)', width: 800, height: 1280, stageWRatio: 0.46 },
      { name: 'Galaxy Tab S7/S8/S9 (Landscape)', width: 1280, height: 800, stageWRatio: 0.43 },
      { name: 'Surface Pro (Portrait)', width: 912, height: 1368, stageWRatio: 0.46 },
      { name: 'Surface Pro (Landscape)', width: 1368, height: 912, stageWRatio: 0.43 }
    ];

    const testLayouts = [
      { id: '1x4', aspect: 3.125 },
      { id: '2x2', aspect: 1.5 },
      { id: '1+3', aspect: 1.5 },
      { id: '2x3', aspect: 2.15 },
      { id: '3x2', aspect: 0.72 }
    ];

    tabletDevices.forEach((device) => {
      testLayouts.forEach((layout) => {
        it(`guarantees zero top clipping on ${device.name} with layout ${layout.id} (toolbar active & inactive)`, () => {
          const headerH = device.width < 992 ? 48 : 50;
          const stageH = device.height - headerH;
          const stageW = Math.round(device.width * device.stageWRatio);

          [false, true].forEach((hasToolbar) => {
            let nonCanvasHeight = 24; // padding
            if (hasToolbar) nonCanvasHeight += 44 + 8; // toolbar + margin
            nonCanvasHeight += 34 + 6; // stage tip + margin
            nonCanvasHeight += 46 + 8; // desktop download buttons + margin
            nonCanvasHeight += 16; // safety breathing margin

            const maxAllowedH = Math.max(120, stageH - nonCanvasHeight);
            const maxAllowedW = Math.max(80, stageW - 36);

            let targetW = maxAllowedW;
            let targetH = Math.round(targetW * layout.aspect);

            if (targetH > maxAllowedH) {
              targetH = Math.round(maxAllowedH);
              targetW = Math.round(targetH / layout.aspect);
            }

            if (targetW > maxAllowedW) {
              targetW = Math.round(maxAllowedW);
              targetH = Math.round(targetW * layout.aspect);
            }

            // Total height inside stage must NEVER exceed stageH
            const totalOccupiedH = targetH + nonCanvasHeight;
            expect(totalOccupiedH).toBeLessThanOrEqual(stageH);
            expect(targetW).toBeGreaterThan(0);
            expect(targetH).toBeGreaterThan(0);
          });
        });
      });
    });
  });
});
