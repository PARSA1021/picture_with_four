import { store } from '../state/store.ts';
import { TextConfig } from '../state/types.ts';

export interface OverlayElements {
  mainTextEl: HTMLElement;
  subTextEl: HTMLElement;
  containerEl: HTMLElement;
}

export class TextOverlayEngine {
  private mainTextEl: HTMLElement;
  private subTextEl: HTMLElement;
  private containerEl: HTMLElement;
  private activeDraggingEl: HTMLElement | null = null;
  private activeKey: 'mainText' | 'subText' | null = null;
  private startPointerX = 0;
  private startPointerY = 0;
  private startConfigX = 0.5;
  private startConfigY = 0.5;

  constructor(elements: OverlayElements) {
    this.mainTextEl = elements.mainTextEl;
    this.subTextEl = elements.subTextEl;
    this.containerEl = elements.containerEl;

    this.bindOverlayEvents(this.mainTextEl, 'mainText');
    this.bindOverlayEvents(this.subTextEl, 'subText');
  }

  public sync(mainConfig: TextConfig, subConfig: TextConfig) {
    this.updateElement(this.mainTextEl, mainConfig);
    this.updateElement(this.subTextEl, subConfig);
  }

  private updateElement(el: HTMLElement, config: TextConfig) {
    if (!config.content || !config.content.trim()) {
      el.style.display = 'none';
      return;
    }
    el.style.display = 'block';

    if (!el.classList.contains('is-dragging')) {
      el.style.left = `${(config.x * 100).toFixed(2)}%`;
      el.style.top = `${(config.y * 100).toFixed(2)}%`;
    }

    el.innerText = config.content;
    el.style.fontFamily = `"${config.font}", sans-serif`;
    el.style.fontSize = `${config.size}px`;
    el.style.color = config.color;

    if (config.effect === 'soft-shadow') {
      el.style.textShadow = '0 3px 10px rgba(0, 0, 0, 0.5)';
    } else if (config.effect === 'sticker-outline' || (config.strokeWidth && config.strokeWidth > 0)) {
      const sw = config.strokeWidth || 3;
      const sc = config.strokeColor || (config.color === '#ffffff' || config.color === '#fafafa' ? '#000000' : '#ffffff');
      el.style.textShadow = `
        -${sw}px -${sw}px 0 ${sc},
         ${sw}px -${sw}px 0 ${sc},
        -${sw}px  ${sw}px 0 ${sc},
         ${sw}px  ${sw}px 0 ${sc},
         0px -${sw}px 0 ${sc},
         0px  ${sw}px 0 ${sc},
        -${sw}px  0px 0 ${sc},
         ${sw}px  0px 0 ${sc}
      `;
    } else {
      el.style.textShadow = 'none';
    }
  }

  private bindOverlayEvents(el: HTMLElement, key: 'mainText' | 'subText') {
    el.tabIndex = 0;
    el.setAttribute('role', 'button');
    el.setAttribute('aria-label', `${key === 'mainText' ? '메인 타이틀' : '서브 텍스트'} 위치 드래그`);

    el.addEventListener('pointerdown', (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      el.setPointerCapture(e.pointerId);

      this.activeDraggingEl = el;
      this.activeKey = key;
      el.classList.add('is-dragging');

      this.startPointerX = e.clientX;
      this.startPointerY = e.clientY;

      const currentConfig = store.getConfig()[key];
      this.startConfigX = currentConfig.x;
      this.startConfigY = currentConfig.y;
    });

    el.addEventListener('pointermove', (e: PointerEvent) => {
      if (this.activeDraggingEl !== el || !this.activeKey) return;
      e.preventDefault();

      const rect = this.containerEl.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const deltaX = (e.clientX - this.startPointerX) / rect.width;
      const deltaY = (e.clientY - this.startPointerY) / rect.height;

      // Dynamically clamp dragging so text never leaves the card boundary
      const halfWidthPercent = rect.width > 0 ? (el.offsetWidth / rect.width) / 2 : 0.12;
      const minX = Math.max(0.06, halfWidthPercent + 0.01);
      const maxX = Math.max(minX, Math.min(0.94, 1 - halfWidthPercent - 0.01));

      const halfHeightPercent = rect.height > 0 ? (el.offsetHeight / rect.height) / 2 : 0.02;
      const minY = Math.max(0.03, halfHeightPercent);
      const maxY = Math.max(minY, Math.min(0.97, 1 - halfHeightPercent));

      const newX = Math.max(minX, Math.min(maxX, this.startConfigX + deltaX));
      const newY = Math.max(minY, Math.min(maxY, this.startConfigY + deltaY));

      el.style.left = `${(newX * 100).toFixed(2)}%`;
      el.style.top = `${(newY * 100).toFixed(2)}%`;

      if (this.activeKey === 'mainText') {
        store.updateMainText({ x: newX, y: newY });
      } else {
        store.updateSubText({ x: newX, y: newY });
      }
    });

    const endDrag = (e: PointerEvent) => {
      if (this.activeDraggingEl === el) {
        el.releasePointerCapture(e.pointerId);
        el.classList.remove('is-dragging');
        this.activeDraggingEl = null;
        this.activeKey = null;
      }
    };

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);

    el.addEventListener('keydown', (e: KeyboardEvent) => {
      const step = e.shiftKey ? 0.02 : 0.005;
      const current = store.getConfig()[key];
      let nx = current.x;
      let ny = current.y;
      let handled = false;

      if (e.key === 'ArrowLeft') {
        nx = Math.max(0.05, nx - step);
        handled = true;
      } else if (e.key === 'ArrowRight') {
        nx = Math.min(0.95, nx + step);
        handled = true;
      } else if (e.key === 'ArrowUp') {
        ny = Math.max(0.05, ny - step);
        handled = true;
      } else if (e.key === 'ArrowDown') {
        ny = Math.min(0.98, ny + step);
        handled = true;
      }

      if (handled) {
        e.preventDefault();
        if (key === 'mainText') {
          store.updateMainText({ x: nx, y: ny });
        } else {
          store.updateSubText({ x: nx, y: ny });
        }
      }
    });
  }
}
