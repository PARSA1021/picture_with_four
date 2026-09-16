import { store } from '../state/store.ts';
import { $, trapFocus } from '../utils/dom.ts';
import { showToast } from './Toast.ts';

export class EditModal {
  private modalEl: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private zoomSlider: HTMLInputElement;
  private offsetXSlider: HTMLInputElement;
  private offsetYSlider: HTMLInputElement;
  private zoomValueText: HTMLElement;
  private offsetXValueText: HTMLElement;
  private offsetYValueText: HTMLElement;
  private saveBtn: HTMLButtonElement;
  private cancelBtn: HTMLButtonElement;

  private currentImageIndex: number | null = null;
  private zoom = 100;
  private offsetX = 0;
  private offsetY = 0;

  // Pointer panning state
  private isPointerDown = false;
  private startPointerX = 0;
  private startPointerY = 0;
  private startOffsetX = 0;
  private startOffsetY = 0;
  private releaseFocusTrap: (() => void) | null = null;

  constructor() {
    this.modalEl = $<HTMLElement>('#imageEditModal');
    this.canvas = $<HTMLCanvasElement>('#editCanvas');
    const context = this.canvas.getContext('2d');
    if (!context) throw new Error('EditCanvas context not available');
    this.ctx = context;

    this.zoomSlider = $<HTMLInputElement>('#zoomSlider');
    this.offsetXSlider = $<HTMLInputElement>('#offsetXSlider');
    this.offsetYSlider = $<HTMLInputElement>('#offsetYSlider');

    this.zoomValueText = $<HTMLElement>('#zoomValue');
    this.offsetXValueText = $<HTMLElement>('#offsetXValue');
    this.offsetYValueText = $<HTMLElement>('#offsetYValue');

    this.saveBtn = $<HTMLButtonElement>('#editSaveBtn');
    this.cancelBtn = $<HTMLButtonElement>('#editCancelBtn');

    this.bindEvents();

    store.subscribeSelection(() => {
      if (store.editingImageIndex !== null) {
        this.open(store.editingImageIndex);
      } else {
        this.close();
      }
    });
  }

  private bindEvents() {
    this.saveBtn.addEventListener('click', () => this.save());
    this.cancelBtn.addEventListener('click', () => this.close());

    this.zoomSlider.addEventListener('input', () => {
      this.zoom = parseInt(this.zoomSlider.value, 10);
      this.zoomValueText.textContent = String(this.zoom);
      this.draw();
    });

    this.offsetXSlider.addEventListener('input', () => {
      this.offsetX = parseInt(this.offsetXSlider.value, 10);
      this.offsetXValueText.textContent = String(this.offsetX);
      this.draw();
    });

    this.offsetYSlider.addEventListener('input', () => {
      this.offsetY = parseInt(this.offsetYSlider.value, 10);
      this.offsetYValueText.textContent = String(this.offsetY);
      this.draw();
    });

    // Direct pointer panning on the edit canvas
    this.canvas.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      this.isPointerDown = true;
      this.canvas.setPointerCapture(e.pointerId);
      this.canvas.classList.add('is-panning');

      this.startPointerX = e.clientX;
      this.startPointerY = e.clientY;
      this.startOffsetX = this.offsetX;
      this.startOffsetY = this.offsetY;
    });

    this.canvas.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isPointerDown) return;
      e.preventDefault();

      const dx = e.clientX - this.startPointerX;
      const dy = e.clientY - this.startPointerY;

      this.offsetX = Math.max(-150, Math.min(150, Math.round(this.startOffsetX + dx)));
      this.offsetY = Math.max(-150, Math.min(150, Math.round(this.startOffsetY + dy)));

      this.offsetXSlider.value = String(this.offsetX);
      this.offsetYSlider.value = String(this.offsetY);
      this.offsetXValueText.textContent = String(this.offsetX);
      this.offsetYValueText.textContent = String(this.offsetY);

      this.draw();
    });

    const endPan = (e: PointerEvent) => {
      if (this.isPointerDown) {
        this.isPointerDown = false;
        this.canvas.releasePointerCapture(e.pointerId);
        this.canvas.classList.remove('is-panning');
      }
    };

    this.canvas.addEventListener('pointerup', endPan);
    this.canvas.addEventListener('pointercancel', endPan);

    // Escape key listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('is-open')) {
        this.close();
      }
    });
  }

  public open(index: number) {
    const imgData = store.getConfig().images[index];
    if (!imgData) return;

    this.currentImageIndex = index;
    this.zoom = imgData.zoom || 100;
    this.offsetX = imgData.offsetX || 0;
    this.offsetY = imgData.offsetY || 0;

    this.zoomSlider.value = String(this.zoom);
    this.offsetXSlider.value = String(this.offsetX);
    this.offsetYSlider.value = String(this.offsetY);

    this.zoomValueText.textContent = String(this.zoom);
    this.offsetXValueText.textContent = String(this.offsetX);
    this.offsetYValueText.textContent = String(this.offsetY);

    this.modalEl.classList.add('is-open');
    this.releaseFocusTrap = trapFocus(this.modalEl);

    // Ensure canvas size is set properly
    const size = 360;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = size * dpr;
    this.canvas.height = size * dpr;
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.draw();
  }

  public close() {
    this.modalEl.classList.remove('is-open');
    this.currentImageIndex = null;
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
    if (store.editingImageIndex !== null) {
      store.setEditingImage(null);
    }
  }

  private save() {
    if (this.currentImageIndex !== null) {
      store.updateImageCrop(this.currentImageIndex, {
        zoom: this.zoom,
        offsetX: this.offsetX,
        offsetY: this.offsetY
      });
      showToast('사진 구도가 적용되었습니다.');
      this.close();
    }
  }

  private draw() {
    if (this.currentImageIndex === null) return;
    const imgData = store.getConfig().images[this.currentImageIndex];
    if (!imgData) return;

    const w = 360;
    const h = 360;

    this.ctx.fillStyle = '#0f172a';
    this.ctx.fillRect(0, 0, w, h);

    const { image, flipped, rotation, filter } = imgData;
    const isRotated90 = rotation === 90 || rotation === 270;
    const imgRatio = image.width / image.height;
    const containerRatio = w / h;

    let baseW: number;
    let baseH: number;

    if (isRotated90) {
      const effectiveAspect = 1 / imgRatio;
      if (effectiveAspect > containerRatio) {
        baseW = h;
        baseH = h * effectiveAspect;
      } else {
        baseH = w;
        baseW = w * imgRatio;
      }
    } else {
      if (imgRatio > containerRatio) {
        baseH = h;
        baseW = h * imgRatio;
      } else {
        baseW = w;
        baseH = w / imgRatio;
      }
    }

    const zoomFactor = this.zoom / 100;
    const drawW = baseW * zoomFactor;
    const drawH = baseH * zoomFactor;

    this.ctx.save();
    // Translate with user pan offset
    this.ctx.translate(w / 2 + this.offsetX, h / 2 + this.offsetY);

    if (flipped) {
      this.ctx.scale(-1, 1);
    }

    if (rotation) {
      this.ctx.rotate((rotation * Math.PI) / 180);
    }

    if (filter === 'sepia') {
      this.ctx.filter = 'sepia(0.85) contrast(0.95)';
    }

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    this.ctx.restore();

    // Center guide lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([4, 4]);

    this.ctx.beginPath();
    this.ctx.moveTo(w / 2, 0);
    this.ctx.lineTo(w / 2, h);
    this.ctx.moveTo(0, h / 2);
    this.ctx.lineTo(w, h / 2);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
  }
}
