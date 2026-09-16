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

document.addEventListener('DOMContentLoaded', async () => {
  const resultModal = new ResultModal();
  const exportService = new ExportService(resultModal);
  new EditModal();
  new PreviewStrip();
  new TabControl(exportService);
  const canvasView = new CanvasView();

  // Initialize Progressive Web App (PWA) installation
  pwaInstaller.init('headerInstallBtn');

  // iOS Safari install guide close button
  document.getElementById('closeIosInstallBtn')?.addEventListener('click', () => {
    document.getElementById('iosInstallModal')?.classList.remove('is-open');
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
