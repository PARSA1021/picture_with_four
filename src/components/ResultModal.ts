import { $, trapFocus } from '../utils/dom.ts';

export class ResultModal {
  private modalEl: HTMLElement;
  private resultImg: HTMLImageElement;
  private closeBtn: HTMLButtonElement;
  private downloadBtn: HTMLButtonElement | null = null;
  private currentUrl: string | null = null;
  private currentFileName: string = 'pic4u_photo.png';
  private releaseFocusTrap: (() => void) | null = null;

  constructor() {
    this.modalEl = $<HTMLElement>('#resultModal');
    this.resultImg = $<HTMLImageElement>('#resultImage');
    this.closeBtn = $<HTMLButtonElement>('#closeModalBtn');
    this.downloadBtn = document.querySelector<HTMLButtonElement>('#modalDownloadBtn');

    this.closeBtn.addEventListener('click', () => this.close());

    this.downloadBtn?.addEventListener('click', () => {
      if (this.currentUrl) {
        const link = document.createElement('a');
        link.href = this.currentUrl;
        link.download = this.currentFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modalEl.classList.contains('is-open')) {
        this.close();
      }
    });
  }

  public open(url: string, fileName?: string) {
    this.currentUrl = url;
    if (fileName) this.currentFileName = fileName;
    this.resultImg.src = url;
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
