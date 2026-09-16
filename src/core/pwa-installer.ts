import { showToast } from '../components/Toast.ts';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PwaInstaller {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private installButton: HTMLElement | null = null;
  private isStandalone = false;

  constructor() {
    this.isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    this.registerServiceWorker();
    this.listenInstallPrompt();
  }

  public init(installButtonId: string) {
    this.installButton = document.getElementById(installButtonId);
    if (!this.installButton) return;

    if (this.isStandalone) {
      // Already running as installed app
      this.installButton.style.display = 'none';
      return;
    }

    // On iOS Safari, beforeinstallprompt never fires, so show button to give instructions
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isIos) {
      this.installButton.style.display = 'inline-flex';
    }

    this.installButton.addEventListener('click', () => {
      this.promptInstall();
    });
  }

  private registerServiceWorker() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('Service Worker registered successfully with scope:', reg.scope);
          })
          .catch((err) => {
            console.warn('Service Worker registration failed:', err);
          });
      });
    }
  }

  private listenInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      if (this.installButton && !this.isStandalone) {
        this.installButton.style.display = 'inline-flex';
      }
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      if (this.installButton) {
        this.installButton.style.display = 'none';
      }
      showToast('🎉 PIC4U 앱이 홈 화면에 성공적으로 설치되었습니다!');
    });
  }

  public async promptInstall() {
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (isIos) {
      this.showIosInstallGuide();
      return;
    }

    if (!this.deferredPrompt) {
      showToast('💡 브라우저 메뉴(⋮)에서 [앱 설치] 또는 [홈 화면에 추가]를 선택하세요.');
      return;
    }

    try {
      await this.deferredPrompt.prompt();
      const choice = await this.deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('📱 앱 설치를 시작합니다!');
      }
      this.deferredPrompt = null;
    } catch (err) {
      console.error('Install prompt error:', err);
    }
  }

  private showIosInstallGuide() {
    const guideEl = document.getElementById('iosInstallModal');
    if (guideEl) {
      guideEl.classList.add('is-open');
    } else {
      showToast('📱 하단 공유 버튼(⎋)을 누른 후 [홈 화면에 추가]를 선택하세요!');
    }
  }
}

export const pwaInstaller = new PwaInstaller();
