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

    showLoader(true, '고해상도 이미지를 생성하는 중입니다...');

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
      baseScreenWidth: 400
    });

    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        exportCanvas.toBlob(resolve, 'image/png', 1.0)
      );

      if (!blob) throw new Error('Blob creation failed');

      const fileName = `frame_diary_${Date.now()}.png`;
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
            title: 'Frame Diary Pro',
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

      // Fallback: direct download link
      const blobUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(blobUrl);

      showLoader(false);
      showToast('✅ 고화질 사진이 저장되었습니다! 📥');
    } catch (err) {
      console.error('Save failed:', err);
      showLoader(false);

      // Fallback: show result modal
      const dataUrl = exportCanvas.toDataURL('image/png');
      this.resultModal.open(dataUrl);
      showToast('💡 이미지를 길게 눌러 사진 앱에 저장할 수 있습니다.');
    }
  }
}
