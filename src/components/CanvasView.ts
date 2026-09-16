import { renderScene } from '../core/canvas-renderer.ts';
import { getLayoutAspectRatio } from '../core/layout-engine.ts';
import { StickerEngine } from '../core/sticker-engine.ts';
import { TextOverlayEngine } from '../core/text-engine.ts';
import { store } from '../state/store.ts';
import { LayoutSlot } from '../state/types.ts';
import { $, $$ } from '../utils/dom.ts';
import { showToast } from './Toast.ts';

export class CanvasView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private container: HTMLElement;
  private slotOverlayContainer: HTMLElement;
  private textEngine: TextOverlayEngine;
  private stickerEngine: StickerEngine;
  private quickToolbarEl: HTMLElement | null = null;
  private currentSlots: LayoutSlot[] = [];
  private renderPending = false;

  constructor() {
    this.canvas = $<HTMLCanvasElement>('#photoCanvas');
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context could not be created');
    this.ctx = context;

    this.container = $<HTMLElement>('#canvasContainer');
    this.slotOverlayContainer = $<HTMLElement>('#slotOverlayContainer');

    const mainTextEl = $<HTMLElement>('#mainTextOverlay');
    const subTextEl = $<HTMLElement>('#subTextOverlay');

    this.textEngine = new TextOverlayEngine({
      mainTextEl,
      subTextEl,
      containerEl: this.container
    });

    let stickerContainer = document.getElementById('stickerOverlayContainer');
    if (!stickerContainer) {
      stickerContainer = document.createElement('div');
      stickerContainer.id = 'stickerOverlayContainer';
      this.container.appendChild(stickerContainer);
    }
    this.stickerEngine = new StickerEngine(stickerContainer);

    this.initQuickToolbar();
    this.setupResizeObserver();
    this.bindStore();

    // Click outside deselects active slot
    document.addEventListener('pointerdown', (e) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('.slot-overlay') &&
        !target.closest('.slot-quick-toolbar') &&
        !target.closest('#imageEditModal')
      ) {
        if (store.selectedSlotIndex !== null) {
          store.setSelectedSlot(null);
        }
      }
    });
  }

  private initQuickToolbar() {
    let el = document.getElementById('slotQuickToolbar');
    if (!el) {
      el = document.createElement('div');
      el.id = 'slotQuickToolbar';
      el.className = 'slot-quick-toolbar';
      el.innerHTML = `
        <button type="button" class="toolbar-btn btn-toolbar-rotate" title="90도 회전">
          <svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.85.83 6.72 2.24L21 3v6h-6l2.3-2.3A7 7 0 1 0 19 12h2z" fill="currentColor"/></svg>
          <span>회전</span>
        </button>
        <button type="button" class="toolbar-btn btn-toolbar-flip" title="좌우 반전">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l-6-7 6-7zm8 0l6 7-6 7V5zM12 3v18h-1V3h1z" fill="currentColor"/></svg>
          <span>반전</span>
        </button>
        <button type="button" class="toolbar-btn btn-toolbar-edit" title="사진 맞춤/확대 조정">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6" stroke="currentColor" stroke-width="2" fill="none"/><path d="M15.5 15.5l4.5 4.5" stroke="currentColor" stroke-width="2"/></svg>
          <span>맞춤</span>
        </button>
        <button type="button" class="toolbar-btn btn-toolbar-change" title="새 사진으로 바꾸기">
          <svg viewBox="0 0 24 24"><path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 4v12m0-12l-4 4m4-4l4 4" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          <span>교체</span>
        </button>
        <button type="button" class="toolbar-btn btn-toolbar-delete" title="이 사진 삭제">
          <svg viewBox="0 0 24 24"><path d="M19 7l-.8 12a2 2 0 01-2 2H7.8a2 2 0 01-2-2L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" stroke="currentColor" stroke-width="2" fill="none"/></svg>
          <span>삭제</span>
        </button>
        <button type="button" class="toolbar-btn btn-toolbar-close" title="닫기">✕</button>
      `;
      // Append right below the canvas inside the canvas-stage
      const stage = this.container.closest('.canvas-stage') || this.container.parentElement;
      stage?.appendChild(el);
    }
    this.quickToolbarEl = el;

    // Bind quick toolbar button actions
    el.querySelector('.btn-toolbar-rotate')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (store.selectedSlotIndex !== null) {
        store.rotateImage(store.selectedSlotIndex);
        showToast('사진이 90도 회전되었습니다.');
      }
    });

    el.querySelector('.btn-toolbar-flip')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (store.selectedSlotIndex !== null) {
        store.flipImage(store.selectedSlotIndex);
        showToast('사진이 좌우 반전되었습니다.');
      }
    });

    el.querySelector('.btn-toolbar-edit')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (store.selectedSlotIndex !== null) {
        const slotIdx = store.selectedSlotIndex;
        store.setSelectedSlot(null);
        store.setEditingImage(slotIdx);
      }
    });

    el.querySelector('.btn-toolbar-change')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (store.selectedSlotIndex !== null) {
        store.targetUploadSlotIndex = store.selectedSlotIndex;
        $<HTMLInputElement>('#imageUpload').click();
        showToast('교체할 새 사진을 선택하세요.');
      }
    });

    el.querySelector('.btn-toolbar-delete')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (store.selectedSlotIndex !== null) {
        const idx = store.selectedSlotIndex;
        store.clearSlot(idx);
        store.setSelectedSlot(null);
        showToast('사진이 슬롯에서 제거되었습니다.');
      }
    });

    el.querySelector('.btn-toolbar-close')?.addEventListener('click', (e) => {
      e.stopPropagation();
      store.setSelectedSlot(null);
    });
  }

  private setupResizeObserver() {
    let resizeTimer: number | null = null;
    const observer = new ResizeObserver(() => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        this.resizeAndRender();
      }, 30);
    });
    observer.observe(this.container);
  }

  private bindStore() {
    store.subscribe(() => {
      this.requestRender();
    });

    store.subscribeSelection(() => {
      this.updateSlotSelectionDOM();
    });
  }

  public requestRender() {
    if (this.renderPending) return;
    this.renderPending = true;
    requestAnimationFrame(() => {
      this.renderPending = false;
      this.render();
    });
  }

  public resizeAndRender() {
    const config = store.getConfig();
    const width = this.container.clientWidth || 340;
    const aspect = getLayoutAspectRatio(config.layout);
    const height = Math.round(width * aspect);

    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);

    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.render();
  }

  private render() {
    const config = store.getConfig();
    const width = this.canvas.width / Math.min(window.devicePixelRatio || 1, 2.5);
    const height = this.canvas.height / Math.min(window.devicePixelRatio || 1, 2.5);

    this.currentSlots = renderScene(this.ctx, width, height, config, {
      isExport: false,
      selectedSlotIndex: store.selectedSlotIndex,
      baseScreenWidth: width
    });

    this.renderSlotOverlays(this.currentSlots);
    this.textEngine.sync(config.mainText, config.subText);
    this.stickerEngine.sync(config.stickers, width);
    this.updateSlotSelectionDOM();
  }

  private renderSlotOverlays(slots: LayoutSlot[]) {
    this.slotOverlayContainer.innerHTML = '';

    slots.forEach((slot) => {
      const slotEl = document.createElement('div');
      slotEl.className = 'slot-overlay';
      slotEl.tabIndex = 0;
      slotEl.setAttribute('role', 'button');
      slotEl.setAttribute(
        'aria-label',
        `슬롯 ${slot.index + 1}: ${
          store.getConfig().images[slot.index] ? '사진 있음 (터치하여 수정)' : '비어 있음 (터치하여 사진 추가)'
        }`
      );

      if (store.selectedSlotIndex === slot.index) {
        slotEl.classList.add('selected');
      }

      slotEl.style.left = `${slot.x}px`;
      slotEl.style.top = `${slot.y}px`;
      slotEl.style.width = `${slot.w}px`;
      slotEl.style.height = `${slot.h}px`;

      slotEl.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleSlotInteraction(slot.index);
      });

      slotEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.handleSlotInteraction(slot.index);
        }
      });

      this.slotOverlayContainer.appendChild(slotEl);
    });
  }

  private updateSlotSelectionDOM() {
    const overlays = $$<HTMLElement>('.slot-overlay', this.slotOverlayContainer);
    overlays.forEach((el, idx) => {
      if (store.selectedSlotIndex === idx) {
        el.classList.add('selected');
      } else {
        el.classList.remove('selected');
      }
    });

    // Update floating quick toolbar visibility
    if (this.quickToolbarEl) {
      if (
        store.selectedSlotIndex !== null &&
        store.getConfig().images[store.selectedSlotIndex]
      ) {
        this.quickToolbarEl.classList.add('show');
      } else {
        this.quickToolbarEl.classList.remove('show');
      }
    }
  }

  private handleSlotInteraction(index: number) {
    const config = store.getConfig();
    const hasPhoto = Boolean(config.images[index]);

    // 1. If an image from PreviewStrip was selected
    if (store.selectedPreviewIndex !== null) {
      const previewIdx = store.selectedPreviewIndex;
      store.setSelectedPreview(null);
      if (previewIdx !== index) {
        store.swapImages(previewIdx, index);
        showToast(`사진이 슬롯 ${index + 1}번으로 이동되었습니다! 🔄`);
      }
      return;
    }

    // 2. If clicking an EMPTY slot -> Direct Upload to this slot!
    if (!hasPhoto) {
      store.targetUploadSlotIndex = index;
      store.setSelectedSlot(null);
      $<HTMLInputElement>('#imageUpload').click();
      showToast(`슬롯 ${index + 1}번에 넣을 사진을 선택하세요 📸`);
      return;
    }

    // 3. If clicking already selected slot -> Deselect
    if (store.selectedSlotIndex === index) {
      store.setSelectedSlot(null);
      return;
    }

    // 4. If another slot was already selected and user clicks this slot -> Swap them!
    if (store.selectedSlotIndex !== null) {
      const prevIdx = store.selectedSlotIndex;
      store.setSelectedSlot(null);
      store.swapImages(prevIdx, index);
      showToast(`슬롯 ${prevIdx + 1}번과 ${index + 1}번 사진이 교체되었습니다! 🔄`);
      return;
    }

    // 5. Select this slot & open contextual toolbar
    store.setSelectedSlot(index);
    showToast(`슬롯 ${index + 1}번 선택됨. 하단 툴바에서 회전/반전/조정하거나 다른 사진과 바꾸세요.`);
  }
}
