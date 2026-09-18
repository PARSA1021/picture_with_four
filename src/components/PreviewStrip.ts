import { MAX_IMAGES } from '../core/constants.ts';
import { generateDemoPhotos } from '../core/demo-photos.ts';
import { processImageFile } from '../core/image-processor.ts';
import { store } from '../state/store.ts';
import { $ } from '../utils/dom.ts';
import { showLoader } from './Loader.ts';
import { showToast } from './Toast.ts';

export class PreviewStrip {
  private container: HTMLElement;
  private statusText: HTMLElement;
  private clearBtn: HTMLElement;
  private dropZone: HTMLElement;
  private fileInput: HTMLInputElement;
  private demoBtn: HTMLElement | null = null;

  constructor() {
    this.container = $<HTMLElement>('#imagePreviews');
    this.statusText = $<HTMLElement>('#fileStatus');
    this.clearBtn = $<HTMLElement>('#clearImagesBtn');
    this.dropZone = $<HTMLElement>('#dropZone');
    this.fileInput = $<HTMLInputElement>('#imageUpload');
    this.demoBtn = document.getElementById('btnLoadDemoPhotos');

    this.setupEvents();
    this.render();

    store.subscribe(() => this.render());
    store.subscribeSelection(() => this.render());
  }

  private setupEvents() {
    this.dropZone.addEventListener('click', () => this.fileInput.click());

    this.demoBtn?.addEventListener('click', async () => {
      showLoader(true, '스튜디오 샘플 사진을 생성하는 중입니다...');
      try {
        const demoImages = await generateDemoPhotos();
        store.clearImages();
        store.addImages(demoImages);
        showToast('스튜디오 샘플 사진 4장이 추가되었습니다.');
      } catch (e) {
        console.error(e);
        showToast('샘플 사진 로드 중 오류가 발생했습니다.');
      } finally {
        showLoader(false);
      }
    });

    this.dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropZone.classList.add('is-dragover');
    });

    this.dropZone.addEventListener('dragleave', () => {
      this.dropZone.classList.remove('is-dragover');
    });

    this.dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropZone.classList.remove('is-dragover');
      if (e.dataTransfer?.files) {
        this.handleFiles(Array.from(e.dataTransfer.files));
      }
    });

    this.fileInput.addEventListener('change', () => {
      if (this.fileInput.files) {
        this.handleFiles(Array.from(this.fileInput.files));
        this.fileInput.value = '';
      }
    });

    this.clearBtn.addEventListener('click', () => {
      if (store.getConfig().images.length === 0) return;
      if (window.confirm('추가된 모든 사진을 삭제하시겠습니까?')) {
        store.clearImages();
        showToast('모든 사진이 삭제되었습니다.');
      }
    });

    const shuffleBtn = document.getElementById('btnShuffleImages');
    shuffleBtn?.addEventListener('click', () => {
      if (store.getConfig().images.length <= 1) {
        showToast('사진이 2장 이상 있어야 순서를 섞을 수 있습니다.');
        return;
      }
      store.shuffleImages();
      showToast('🔀 사진 순서가 셔플되었습니다.');
    });
  }

  public async handleFiles(files: File[]) {
    const validImageFiles = files.filter((f) => f.type.startsWith('image/'));
    if (validImageFiles.length === 0) {
      showToast('이미지 파일(JPG, PNG, WebP)만 업로드할 수 있습니다.');
      return;
    }

    const currentCount = store.getConfig().images.length;
    const remainingSlots = MAX_IMAGES - currentCount;

    if (remainingSlots <= 0) {
      showToast(`최대 ${MAX_IMAGES}장까지만 추가할 수 있습니다.`);
      return;
    }

    const filesToProcess = validImageFiles.slice(0, remainingSlots);
    showLoader(true, `사진을 최적화하는 중입니다 (${filesToProcess.length}장)...`);

    try {
      const activeFilter = store.getConfig().images[0]?.filter || null;
      const newImages = await Promise.all(
        filesToProcess.map((f) => processImageFile(f, activeFilter))
      );

      store.addImages(newImages);
      showToast(`사진 ${newImages.length}장이 추가되었습니다.`);
    } catch (err) {
      console.error(err);
      showToast('일부 이미지를 처리하는 중 오류가 발생했습니다.');
    } finally {
      showLoader(false);
    }
  }

  private render() {
    const config = store.getConfig();
    const images = config.images;

    this.statusText.textContent = `${images.length} / ${MAX_IMAGES}장 등록`;
    this.container.innerHTML = '';

    if (images.length === 0) {
      this.container.innerHTML = `
        <div class="empty-preview-container">
          <div class="empty-preview-icon">📷</div>
          <div class="empty-preview-title">등록된 사진이 없습니다</div>
          <div class="empty-preview-desc">위의 [내 사진 추가하기]를 누르거나, 스튜디오 샘플 사진 4장으로 바로 시작해 보세요!</div>
        </div>
      `;
      return;
    }

    images.forEach((imgData, index) => {
      const isSelected = store.selectedPreviewIndex === index;
      const itemEl = document.createElement('div');
      itemEl.className = `preview-item ${isSelected ? 'selected' : ''}`;
      itemEl.tabIndex = 0;
      itemEl.setAttribute('role', 'button');
      itemEl.setAttribute('aria-label', `사진 ${index + 1}번 썸네일`);

      itemEl.innerHTML = `
        <img src="${imgData.src}" alt="사진 ${index + 1}" loading="lazy" />
        <span class="preview-badge">${index + 1}</span>
        ${isSelected ? '<span class="preview-selected-indicator">배치 대기</span>' : ''}
        <button type="button" class="preview-btn-delete" title="사진 삭제" aria-label="사진 ${index + 1} 삭제">×</button>
        <div class="preview-action-bar">
          <button type="button" class="preview-action-btn btn-edit" title="구도/위치 상세 편집" aria-label="상세 편집">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button type="button" class="preview-action-btn btn-rotate" title="90도 회전" aria-label="회전">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6"/><path d="M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          </button>
          <button type="button" class="preview-action-btn btn-flip" title="좌우 반전" aria-label="반전">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m7 8-4 4 4 4"/><path d="M3 12h18"/><path d="m17 16 4-4-4-4"/></svg>
          </button>
        </div>
      `;

      // Select / Deselect for slot placement
      itemEl.addEventListener('click', () => {
        if (store.selectedPreviewIndex === index) {
          store.setSelectedPreview(null);
        } else {
          store.setSelectedPreview(index);
          store.setSelectedSlot(null);
          showToast(`사진 ${index + 1}번 선택됨. 배치할 캔버스 슬롯을 터치하세요.`);
        }
      });

      // Delete action
      const deleteBtn = itemEl.querySelector('.preview-btn-delete');
      deleteBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        store.removeImage(index);
        showToast('사진이 삭제되었습니다.');
      });

      // Edit action
      const editBtn = itemEl.querySelector('.btn-edit');
      editBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        store.setEditingImage(index);
      });

      // Rotate action
      const rotateBtn = itemEl.querySelector('.btn-rotate');
      rotateBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        store.rotateImage(index);
      });

      // Flip action
      const flipBtn = itemEl.querySelector('.btn-flip');
      flipBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        store.flipImage(index);
      });

      this.container.appendChild(itemEl);
    });
  }
}
