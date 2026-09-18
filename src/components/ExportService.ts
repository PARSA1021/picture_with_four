import { renderScene } from '../core/canvas-renderer.ts';
import { EXPORT_WIDTH } from '../core/constants.ts';
import { getLayoutAspectRatio } from '../core/layout-engine.ts';
import { store } from '../state/store.ts';
import { showLoader } from './Loader.ts';
import { ResultModal } from './ResultModal.ts';
import { showToast } from './Toast.ts';

export class ExportService {
  private resultModal: ResultModal;

  constructor(resultModal: ResultModal) {
    this.resultModal = resultModal;
  }

  public async exportImage(): Promise<void> {
    const config = store.getConfig();
    if (config.images.length === 0) {
      showToast('⚠️ 먼저 사진을 1장 이상 추가해주세요!');
      return;
    }

    showLoader(true, '고해상도 네컷 사진을 생성하고 있습니다...');

    // Wait for web fonts to be completely rendered
    try {
      if ('fonts' in document) {
        await document.fonts.ready;
      }
    } catch {
      // Ignore font readiness check errors
    }

    // Trigger realistic camera shutter flash
    const flashEl = document.createElement('div');
    flashEl.className = 'camera-flash';
    document.body.appendChild(flashEl);
    setTimeout(() => flashEl.remove(), 400);

    const exportWidth = EXPORT_WIDTH;
    const aspect = getLayoutAspectRatio(config.layout);
    const exportHeight = Math.round(exportWidth * aspect);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;

    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) {
      showLoader(false);
      showToast('⚠️ 이미지 생성 캔버스를 초기화하지 못했습니다.');
      return;
    }

    renderScene(exportCtx, exportWidth, exportHeight, config, {
      isExport: true,
      baseScreenWidth: 330
    });

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        exportCanvas.toBlob(resolve, 'image/png', 1.0)
      );

      if (!blob) throw new Error('Blob creation failed');

      const fileName = `pic4u_fourcut_${Date.now()}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      // Check for Web Share API support
      if (
        navigator.canShare &&
        navigator.canShare({ files: [file] }) &&
        /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      ) {
        try {
          await navigator.share({
            files: [file],
            title: 'PIC4U 인생네컷',
            text: '나만의 네컷 사진 프레임'
          });
          showLoader(false);
          showToast('✅ 사진이 성공적으로 공유되었습니다!');
          return;
        } catch (shareErr: unknown) {
          if ((shareErr as { name?: string }).name !== 'AbortError') {
            console.warn('Share API failed, falling back to download', shareErr);
          }
        }
      }

      // Safe download link with deferred object URL revocation
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Defer URL revocation so the browser download manager can finish writing to disk
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 45000);

      showLoader(false);
      showToast('✅ 고화질 인생네컷 사진이 저장되었습니다! 📥');

      // On mobile devices, also display ResultModal for direct long-press save or re-download
      if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
        this.resultModal.open(blobUrl, fileName);
      }
    } catch (err) {
      console.error('Save failed:', err);
      showLoader(false);

      // Fallback: show result modal
      const dataUrl = exportCanvas.toDataURL('image/png');
      this.resultModal.open(dataUrl, `pic4u_fourcut_${Date.now()}.png`);
      showToast('💡 이미지를 길게 눌러 사진 앱에 저장할 수 있습니다.');
    }
  }

  public async copyImageToClipboard(): Promise<void> {
    const config = store.getConfig();
    if (config.images.length === 0) {
      showToast('⚠️ 먼저 사진을 1장 이상 추가해주세요!');
      return;
    }

    if (!navigator.clipboard || !window.ClipboardItem) {
      showToast('⚠️ 현재 브라우저에서 이미지 클립보드 복사를 지원하지 않습니다.');
      return;
    }

    showLoader(true, '클립보드 이미지를 생성하고 있습니다...');

    try {
      if ('fonts' in document) {
        await document.fonts.ready;
      }
    } catch {
      // Ignore
    }

    const exportWidth = EXPORT_WIDTH;
    const aspect = getLayoutAspectRatio(config.layout);
    const exportHeight = Math.round(exportWidth * aspect);

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = exportWidth;
    exportCanvas.height = exportHeight;

    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) {
      showLoader(false);
      showToast('⚠️ 캔버스 생성 실패');
      return;
    }

    renderScene(exportCtx, exportWidth, exportHeight, config, {
      isExport: true,
      baseScreenWidth: 330
    });

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        exportCanvas.toBlob(resolve, 'image/png', 1.0)
      );
      if (!blob) throw new Error('Blob 생성 실패');

      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': blob
        })
      ]);

      showLoader(false);
      showToast('📋 클립보드에 복사되었습니다! 카톡이나 메모장에 바로 붙여넣기(Ctrl+V)하세요 ✨');
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      showLoader(false);
      showToast('💡 클립보드 복사 권한을 허용해주시거나 고화질 저장을 이용해주세요.');
    }
  }
}
