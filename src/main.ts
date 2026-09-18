import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';

import { CanvasView } from './components/CanvasView.ts';
import { EditModal } from './components/EditModal.ts';
import { ExportService } from './components/ExportService.ts';
import { PreviewStrip } from './components/PreviewStrip.ts';
import { ResultModal } from './components/ResultModal.ts';
import { TabControl } from './components/TabControl.ts';
import { pwaInstaller } from './core/pwa-installer.ts';
import { onBotanicalTextureLoaded } from './core/botanical-frame.ts';
import { onCloudTextureLoaded } from './core/cloud-frame.ts';
import { onOilTextureLoaded } from './core/oil-frame.ts';
import { onRoseTextureLoaded } from './core/rose-frame.ts';
import { onYellowRoseTextureLoaded } from './core/yellow-rose-frame.ts';
import { onAuroraTextureLoaded } from './core/aurora-frame.ts';
import { onCherryTextureLoaded } from './core/cherry-frame.ts';

document.addEventListener('DOMContentLoaded', async () => {
  const resultModal = new ResultModal();
  const exportService = new ExportService(resultModal);
  new EditModal();
  new PreviewStrip();
  new TabControl(exportService);
  const canvasView = new CanvasView();

  // Re-render when asynchronous textures finish loading
  onBotanicalTextureLoaded(() => {
    canvasView.resizeAndRender();
  });

  onCloudTextureLoaded(() => {
    canvasView.resizeAndRender();
  });

  onOilTextureLoaded(() => {
    canvasView.resizeAndRender();
  });

  onRoseTextureLoaded(() => {
    canvasView.resizeAndRender();
  });

  onYellowRoseTextureLoaded(() => {
    canvasView.resizeAndRender();
  });

  onAuroraTextureLoaded(() => {
    canvasView.resizeAndRender();
  });

  onCherryTextureLoaded(() => {
    canvasView.resizeAndRender();
  });

  // Initialize Progressive Web App (PWA) installation
  pwaInstaller.init('headerInstallBtn');

  // iOS Safari install guide close button & backdrop dismiss
  const iosModal = document.getElementById('iosInstallModal');
  document.getElementById('closeIosInstallBtn')?.addEventListener('click', () => {
    iosModal?.classList.remove('is-open');
  });
  iosModal?.addEventListener('click', (e) => {
    if (e.target === iosModal) {
      iosModal.classList.remove('is-open');
    }
  });

  try {
    if ('fonts' in document) {
      await document.fonts.ready;
    }
  } catch (err) {
    console.warn('Font loading check error:', err);
  }

  canvasView.resizeAndRender();
});
