import { store } from '../state/store.ts';
import { StickerItem } from '../state/types.ts';

export class StickerEngine {
  private containerEl: HTMLElement;
  private activeDraggingId: string | null = null;
  private startPointerX = 0;
  private startPointerY = 0;
  private startStickerX = 0;
  private startStickerY = 0;

  constructor(containerEl: HTMLElement) {
    this.containerEl = containerEl;
  }

  public sync(stickers: StickerItem[], canvasWidth: number) {
    this.containerEl.innerHTML = '';
    const scale = canvasWidth / 400;

    stickers.forEach((item) => {
      const el = document.createElement('div');
      el.className = 'sticker-drag-item';
      el.tabIndex = 0;
      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `스티커 ${item.emoji}`);

      el.style.left = `${(item.x * 100).toFixed(2)}%`;
      el.style.top = `${(item.y * 100).toFixed(2)}%`;
      el.style.fontSize = `${Math.round(item.size * scale)}px`;

      el.innerHTML = `
        <span class="sticker-emoji">${item.emoji}</span>
        <button type="button" class="sticker-delete-btn" title="스티커 삭제">×</button>
      `;

      // Delete sticker
      const delBtn = el.querySelector('.sticker-delete-btn');
      delBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        store.removeSticker(item.id);
      });

      // Drag sticker
      el.addEventListener('pointerdown', (e: PointerEvent) => {
        if ((e.target as HTMLElement).closest('.sticker-delete-btn')) return;
        e.preventDefault();
        e.stopPropagation();
        el.setPointerCapture(e.pointerId);

        this.activeDraggingId = item.id;
        el.classList.add('is-dragging');

        this.startPointerX = e.clientX;
        this.startPointerY = e.clientY;
        this.startStickerX = item.x;
        this.startStickerY = item.y;
      });

      el.addEventListener('pointermove', (e: PointerEvent) => {
        if (this.activeDraggingId !== item.id) return;
        e.preventDefault();

        const rect = this.containerEl.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const deltaX = (e.clientX - this.startPointerX) / rect.width;
        const deltaY = (e.clientY - this.startPointerY) / rect.height;

        const newX = Math.max(0.02, Math.min(0.98, this.startStickerX + deltaX));
        const newY = Math.max(0.02, Math.min(0.98, this.startStickerY + deltaY));

        el.style.left = `${(newX * 100).toFixed(2)}%`;
        el.style.top = `${(newY * 100).toFixed(2)}%`;

        store.updateSticker(item.id, { x: newX, y: newY });
      });

      const endDrag = (e: PointerEvent) => {
        if (this.activeDraggingId === item.id) {
          el.releasePointerCapture(e.pointerId);
          el.classList.remove('is-dragging');
          this.activeDraggingId = null;
        }
      };

      el.addEventListener('pointerup', endDrag);
      el.addEventListener('pointercancel', endDrag);

      this.containerEl.appendChild(el);
    });
  }
}
