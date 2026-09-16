import { $, trapFocus } from '../utils/dom.ts';

export class ResultModal {
  private modalEl: HTMLElement;
  private resultImg: HTMLImageElement;
  private closeBtn: HTMLButtonElement;
  private releaseFocusTrap: (() => void) | null = null;

  constructor() {
    this.modalEl = $<HTMLElement>('#resultModal');
    this.resultImg = $<HTMLImageElement>('#resultImage');
    this.closeBtn = $<HTMLButtonElement>('#closeModalBtn');

    this.closeBtn.addEventListener('click', () => this.close());

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('is-open')) {
        this.close();
      }
    });
  }

  public open(dataUrl: string) {
    this.resultImg.src = dataUrl;
    this.modalEl.classList.add('is-open');
    this.releaseFocusTrap = trapFocus(this.modalEl);
  }

  public close() {
    this.modalEl.classList.remove('is-open');
    if (this.releaseFocusTrap) {
      this.releaseFocusTrap();
      this.releaseFocusTrap = null;
    }
  }
}
