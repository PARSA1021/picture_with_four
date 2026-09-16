import { FONTS, FRAME_PRESETS, LAYOUTS, STICKER_PALETTE, THEMES } from '../core/constants.ts';
import { store } from '../state/store.ts';
import { FramePresetType, LayoutType, TextEffectType, ThemeType } from '../state/types.ts';
import { getFormattedDate } from '../utils/date.ts';
import { $, $$, escapeHtml } from '../utils/dom.ts';
import { ExportService } from './ExportService.ts';
import { showToast } from './Toast.ts';

export class TabControl {
  private tabButtons: HTMLButtonElement[];
  private tabContents: HTMLElement[];
  private exportService: ExportService;

  constructor(exportService: ExportService) {
    this.exportService = exportService;
    this.tabButtons = $$<HTMLButtonElement>('.tab-btn');
    this.tabContents = $$<HTMLElement>('.tab-content');

    this.initLayoutButtons();
    this.initPresetButtons();
    this.initThemeButtons();
    this.initFontSelectors();
    this.initStickerPalette();
    this.setupTabNavigation();
    this.setupDesignControls();
    this.setupTextControls();
    this.setupActionButtons();

    this.syncWithStore();
    store.subscribe(() => this.syncWithStore());
  }

  private setupTabNavigation() {
    this.tabButtons.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        this.switchTab(btn.dataset.tab || 'tab-photo');
      });

      btn.addEventListener('keydown', (e) => {
        let targetIdx = idx;
        if (e.key === 'ArrowRight') {
          targetIdx = (idx + 1) % this.tabButtons.length;
        } else if (e.key === 'ArrowLeft') {
          targetIdx = (idx - 1 + this.tabButtons.length) % this.tabButtons.length;
        } else {
          return;
        }
        e.preventDefault();
        const targetBtn = this.tabButtons[targetIdx];
        targetBtn.focus();
        this.switchTab(targetBtn.dataset.tab || 'tab-photo');
      });
    });
  }

  public switchTab(tabId: string) {
    this.tabButtons.forEach((btn) => {
      const isActive = btn.dataset.tab === tabId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    this.tabContents.forEach((content) => {
      const isActive = content.id === tabId;
      content.classList.toggle('active', isActive);
      content.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });
  }

  private initLayoutButtons() {
    const container = $<HTMLElement>('#layoutButtons');
    container.innerHTML = LAYOUTS.map(
      (layout) => `
      <button type="button" class="choice-card btn-layout" data-layout="${layout.id}" role="radio" aria-checked="false">
        <span class="choice-card-title">${escapeHtml(layout.label)}</span>
        <span class="choice-card-desc">${escapeHtml(layout.description)}</span>
      </button>
    `
    ).join('');

    container.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('.btn-layout');
      if (target && target.dataset.layout) {
        store.setLayout(target.dataset.layout as LayoutType);
        showToast(`레이아웃: ${target.querySelector('.choice-card-title')?.textContent}`);
      }
    });
  }

  private initPresetButtons() {
    const container = $<HTMLElement>('#presetButtons');
    container.innerHTML = FRAME_PRESETS.map(
      (preset) => `
      <button type="button" class="choice-card btn-preset" data-preset="${preset.id}" role="radio" aria-checked="false">
        <span class="choice-card-title">${escapeHtml(preset.label)}</span>
        <span class="choice-card-desc">${escapeHtml(preset.description)}</span>
      </button>
    `
    ).join('');

    container.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('.btn-preset');
      if (target && target.dataset.preset) {
        store.setFramePreset(target.dataset.preset as FramePresetType);
        showToast(`스타일 프리셋 [${target.querySelector('.choice-card-title')?.textContent}] 적용`);
      }
    });
  }

  private initThemeButtons() {
    const container = $<HTMLElement>('#themeButtons');
    container.innerHTML = Object.entries(THEMES).map(([key, theme]) => {
      const isBotanical = key === 'botanical-eucalyptus';
      const isRose = key === 'romantic-rose';
      const isCloud = key === 'sky-cloud';
      const isOil = key === 'pastel-oil';
      let extraClass = '';
      let swatchClass = '';
      let swatchBg = theme.bg;
      let icon = '';

      if (isBotanical) {
        extraClass = 'btn-theme-botanical';
        swatchClass = 'swatch-botanical';
        swatchBg = 'linear-gradient(135deg, #f9f9f5 0%, #d8e6d4 50%, #54634b 100%)';
        icon = '<span class="swatch-leaf-icon">🌿</span>';
      } else if (isRose) {
        extraClass = 'btn-theme-rose';
        swatchClass = 'swatch-rose';
        swatchBg = 'linear-gradient(135deg, #fff0f3 0%, #f7a8b8 50%, #e05e78 100%)';
        icon = '<span class="swatch-rose-icon">🌹</span>';
      } else if (isCloud) {
        extraClass = 'btn-theme-cloud';
        swatchClass = 'swatch-cloud';
        swatchBg = 'linear-gradient(135deg, #e0f2fe 0%, #7dc3f5 50%, #388dd0 100%)';
        icon = '<span class="swatch-cloud-icon">☁️</span>';
      } else if (isOil) {
        extraClass = 'btn-theme-oil';
        swatchClass = 'swatch-oil';
        swatchBg = 'linear-gradient(135deg, #f5eefb 0%, #d1c4e9 35%, #f48fb1 70%, #80deea 100%)';
        icon = '<span class="swatch-oil-icon">🎨</span>';
      }

      return `
      <button type="button" class="choice-card btn-theme ${extraClass}" data-theme="${key}" role="radio" aria-checked="false" title="${escapeHtml(theme.name)}">
        <div class="theme-swatch ${swatchClass}" style="background: ${swatchBg}; border-color: ${theme.frame === '#ffffff' ? '#e2e8f0' : theme.frame};">
          ${icon}
        </div>
        <span class="choice-card-title">${escapeHtml(theme.name)}</span>
      </button>
    `;
    }).join('');

    container.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>('.btn-theme');
      if (target && target.dataset.theme) {
        store.setTheme(target.dataset.theme as ThemeType);
        showToast(`테마: ${target.querySelector('.choice-card-title')?.textContent}`);
      }
    });
  }

  private initFontSelectors() {
    const fontOptionsHtml = FONTS.map(
      (f) => `<option value="${escapeHtml(f.val)}">${escapeHtml(f.name)}</option>`
    ).join('');

    const mainFont = $<HTMLSelectElement>('#mainFontSelector');
    mainFont.innerHTML = fontOptionsHtml;
  }

  private initStickerPalette() {
    const container = document.getElementById('stickerPalette');
    if (!container) return;

    container.innerHTML = STICKER_PALETTE.map(
      (emoji) => `
      <button type="button" class="sticker-palette-btn" data-emoji="${emoji}" title="${emoji} 스티커 추가" aria-label="${emoji} 스티커 추가">
        <span>${emoji}</span>
      </button>
    `
    ).join('');

    container.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('.sticker-palette-btn');
      if (btn && btn.dataset.emoji) {
        store.addSticker(btn.dataset.emoji);
        showToast(`${btn.dataset.emoji} 스티커가 추가되었습니다. 캔버스에서 드래그하여 배치하세요.`);
      }
    });

    const clearStkBtn = document.getElementById('btnClearStickers');
    clearStkBtn?.addEventListener('click', () => {
      if (store.getConfig().stickers.length === 0) return;
      store.clearStickers();
      showToast('모든 스티커가 삭제되었습니다.');
    });
  }

  private setupDesignControls() {
    // Custom color pickers
    const frameColorInput = $<HTMLInputElement>('#frameColorPicker');
    const bgColorInput = $<HTMLInputElement>('#bgColorPicker');

    frameColorInput.addEventListener('input', (e) => {
      const color = (e.target as HTMLInputElement).value;
      store.setFrameColor(color);
      $<HTMLElement>('#frameColorValue').textContent = color;
    });

    bgColorInput.addEventListener('input', (e) => {
      const color = (e.target as HTMLInputElement).value;
      store.setBackgroundColor(color);
      $<HTMLElement>('#bgColorValue').textContent = color;
    });

    // Advanced sliders
    const marginSlider = $<HTMLInputElement>('#frameMarginSlider');
    const paddingSlider = $<HTMLInputElement>('#imagePaddingSlider');
    const radiusSlider = $<HTMLInputElement>('#imageRadiusSlider');

    let sliderRaf: number | null = null;
    const throttleSlider = (callback: () => void) => {
      if (sliderRaf) cancelAnimationFrame(sliderRaf);
      sliderRaf = requestAnimationFrame(() => {
        callback();
        sliderRaf = null;
      });
    };

    marginSlider.addEventListener('input', () => {
      const val = parseInt(marginSlider.value, 10);
      $<HTMLElement>('#frameMarginValue').textContent = `${val}%`;
      throttleSlider(() => store.setFrameMargin(val));
    });

    paddingSlider.addEventListener('input', () => {
      const val = parseInt(paddingSlider.value, 10);
      $<HTMLElement>('#imagePaddingValue').textContent = `${val}%`;
      throttleSlider(() => store.setImagePadding(val));
    });

    radiusSlider.addEventListener('input', () => {
      const val = parseInt(radiusSlider.value, 10);
      $<HTMLElement>('#imageRadiusValue').textContent = `${val}px`;
      throttleSlider(() => store.setImageCornerRadius(val));
    });

    // Toggle advanced slider section
    const toggleAdvBtn = document.getElementById('toggleAdvancedSettings');
    const advSection = document.getElementById('advancedSettingsSection');
    toggleAdvBtn?.addEventListener('click', () => {
      const isHidden = advSection?.classList.toggle('hidden');
      if (toggleAdvBtn) {
        toggleAdvBtn.textContent = isHidden ? '세부 여백/모서리 조절 열기' : '세부 조절 닫기';
      }
    });

    // Botanical Signature Edition Banner
    const botanicalBanner = document.getElementById('btnApplyBotanicalTheme');
    if (botanicalBanner) {
      botanicalBanner.addEventListener('click', () => {
        store.setTheme('botanical-eucalyptus');
        showToast('🌿 PIC4U 시그니처 유칼립투스 프레임이 적용되었습니다!');
      });
      botanicalBanner.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          store.setTheme('botanical-eucalyptus');
          showToast('🌿 PIC4U 시그니처 유칼립투스 프레임이 적용되었습니다!');
        }
      });
    }

    // Rose Signature Edition Banner
    const roseBanner = document.getElementById('btnApplyRoseTheme');
    if (roseBanner) {
      roseBanner.addEventListener('click', () => {
        store.setTheme('romantic-rose');
        showToast('🌹 PIC4U 시그니처 로맨틱 로즈 프레임이 적용되었습니다!');
      });
      roseBanner.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          store.setTheme('romantic-rose');
          showToast('🌹 PIC4U 시그니처 로맨틱 로즈 프레임이 적용되었습니다!');
        }
      });
    }

    // Sky Cloud Signature Edition Banner
    const cloudBanner = document.getElementById('btnApplyCloudTheme');
    if (cloudBanner) {
      cloudBanner.addEventListener('click', () => {
        store.setTheme('sky-cloud');
        showToast('☁️ PIC4U 시그니처 퓨어 스카이 프레임이 적용되었습니다!');
      });
      cloudBanner.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          store.setTheme('sky-cloud');
          showToast('☁️ PIC4U 시그니처 퓨어 스카이 프레임이 적용되었습니다!');
        }
      });
    }

    // Pastel Oil Signature Edition Banner
    const oilBanner = document.getElementById('btnApplyOilTheme');
    if (oilBanner) {
      oilBanner.addEventListener('click', () => {
        store.setTheme('pastel-oil');
        showToast('🎨 PIC4U 시그니처 파스텔 유화 프레임이 적용되었습니다!');
      });
      oilBanner.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          store.setTheme('pastel-oil');
          showToast('🎨 PIC4U 시그니처 파스텔 유화 프레임이 적용되었습니다!');
        }
      });
    }
  }

  private setupTextControls() {
    const mainTextInput = $<HTMLInputElement>('#customTextInput');
    const mainFontSelect = $<HTMLSelectElement>('#mainFontSelector');
    const mainColorInput = $<HTMLInputElement>('#mainFontColorPicker');
    const clearMainBtn = document.getElementById('btnClearMainText');
    const restoreBrandBtn = document.getElementById('btnRestoreBrand');

    mainTextInput.addEventListener('input', () => {
      store.updateMainText({ content: mainTextInput.value });
    });

    clearMainBtn?.addEventListener('click', () => {
      mainTextInput.value = '';
      store.updateMainText({ content: '' });
      showToast('메인 타이틀 문구가 제거되었습니다.');
    });

    restoreBrandBtn?.addEventListener('click', () => {
      const brand = 'PIC4U STUDIO';
      mainTextInput.value = brand;
      store.updateMainText({ content: brand });
      showToast('브랜드명이 메인 타이틀로 적용되었습니다.');
    });

    mainFontSelect.addEventListener('change', () => {
      store.updateMainText({ font: mainFontSelect.value });
    });

    mainColorInput.addEventListener('input', () => {
      store.updateMainText({ color: mainColorInput.value });
    });

    // Text size preset buttons [S / M / L]
    $$<HTMLButtonElement>('.btn-text-size').forEach((btn) => {
      btn.addEventListener('click', () => {
        const size = parseInt(btn.dataset.size || '44', 10);
        store.updateMainText({ size });
        showToast(`글자 크기: ${btn.textContent}`);
      });
    });

    // Text effect buttons [심플 / 그림자 / 스티커]
    $$<HTMLButtonElement>('.btn-text-effect').forEach((btn) => {
      btn.addEventListener('click', () => {
        const effect = (btn.dataset.effect || 'none') as TextEffectType;
        store.setTextEffect('mainText', effect);
        showToast(`글자 스타일: ${btn.textContent}`);
      });
    });

    // Subtext & Date Controls
    const subTextInput = $<HTMLInputElement>('#subTextInput');
    const subColorInput = $<HTMLInputElement>('#subFontColorPicker');
    const datePicker = document.getElementById('datePickerInput') as HTMLInputElement | null;
    const todayDateBtn = document.getElementById('btnTodayDate');
    const clearSubBtn = document.getElementById('btnClearSubText');
    const clearAllBtn = document.getElementById('btnClearAllTexts');

    subTextInput.addEventListener('input', () => {
      store.updateSubText({ content: subTextInput.value });
    });

    subColorInput.addEventListener('input', () => {
      store.updateSubText({ color: subColorInput.value });
    });

    // Calendar Date Picker change
    datePicker?.addEventListener('input', () => {
      if (!datePicker.value) return;
      const [year, month, day] = datePicker.value.split('-');
      const formatted = `${year}. ${month}. ${day}`;
      subTextInput.value = formatted;
      store.updateSubText({ content: formatted });
      showToast(`선택한 날짜(${formatted})가 적용되었습니다.`);
    });

    todayDateBtn?.addEventListener('click', () => {
      const today = getFormattedDate();
      subTextInput.value = today;
      store.updateSubText({ content: today });
      if (datePicker) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        datePicker.value = `${y}-${m}-${d}`;
      }
      showToast('오늘 날짜가 입력되었습니다.');
    });

    clearSubBtn?.addEventListener('click', () => {
      subTextInput.value = '';
      if (datePicker) datePicker.value = '';
      store.updateSubText({ content: '' });
      showToast('날짜 문구가 제거되었습니다.');
    });

    clearAllBtn?.addEventListener('click', () => {
      mainTextInput.value = '';
      subTextInput.value = '';
      if (datePicker) datePicker.value = '';
      store.updateMainText({ content: '' });
      store.updateSubText({ content: '' });
      showToast('모든 문구가 제거되었습니다. 깔끔한 무지 프레임 모드입니다.');
    });
  }

  private setupActionButtons() {
    // Desktop download button
    const desktopDownloadBtn = document.getElementById('desktopDownloadBtn');
    desktopDownloadBtn?.addEventListener('click', () => {
      this.exportService.exportImage();
    });

    // Mobile sticky download button
    const mobileDownloadBtn = document.getElementById('mobileDownloadBtn');
    mobileDownloadBtn?.addEventListener('click', () => {
      this.exportService.exportImage();
    });

    // Top Bar Reset Button
    const headerResetBtn = document.getElementById('headerResetBtn');
    headerResetBtn?.addEventListener('click', () => {
      if (window.confirm('모든 사진과 디자인 설정을 초기화하시겠습니까?')) {
        store.fullReset();
        showToast('모든 설정이 초기화되었습니다.');
      }
    });
  }

  private syncWithStore() {
    const config = store.getConfig();

    // Layout active state
    $$<HTMLElement>('#layoutButtons .btn-layout').forEach((btn) => {
      const isActive = btn.dataset.layout === config.layout;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    // Preset active state
    $$<HTMLElement>('#presetButtons .btn-preset').forEach((btn) => {
      const isActive = btn.dataset.preset === config.preset;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    // Theme active state
    $$<HTMLElement>('#themeButtons .btn-theme').forEach((btn) => {
      const isActive = btn.dataset.theme === config.theme;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
    });

    // Botanical banner active state
    const botanicalBanner = document.getElementById('btnApplyBotanicalTheme');
    if (botanicalBanner) {
      botanicalBanner.classList.toggle('active', config.theme === 'botanical-eucalyptus');
    }

    // Rose banner active state
    const roseBanner = document.getElementById('btnApplyRoseTheme');
    if (roseBanner) {
      roseBanner.classList.toggle('active', config.theme === 'romantic-rose');
    }

    // Sky Cloud banner active state
    const cloudBanner = document.getElementById('btnApplyCloudTheme');
    if (cloudBanner) {
      cloudBanner.classList.toggle('active', config.theme === 'sky-cloud');
    }

    // Pastel Oil banner active state
    const oilBanner = document.getElementById('btnApplyOilTheme');
    if (oilBanner) {
      oilBanner.classList.toggle('active', config.theme === 'pastel-oil');
    }

    // Color pickers
    $<HTMLInputElement>('#frameColorPicker').value = config.frameColor;
    $<HTMLElement>('#frameColorValue').textContent = config.frameColor;

    $<HTMLInputElement>('#bgColorPicker').value = config.backgroundColor;
    $<HTMLElement>('#bgColorValue').textContent = config.backgroundColor;

    // Sliders
    $<HTMLInputElement>('#frameMarginSlider').value = String(config.frameMargin);
    $<HTMLElement>('#frameMarginValue').textContent = `${config.frameMargin}%`;

    $<HTMLInputElement>('#imagePaddingSlider').value = String(config.imagePadding);
    $<HTMLElement>('#imagePaddingValue').textContent = `${config.imagePadding}%`;

    $<HTMLInputElement>('#imageRadiusSlider').value = String(config.imageCornerRadius);
    $<HTMLElement>('#imageRadiusValue').textContent = `${config.imageCornerRadius}px`;

    // Main text
    $<HTMLInputElement>('#customTextInput').value = config.mainText.content;
    $<HTMLSelectElement>('#mainFontSelector').value = config.mainText.font;
    $<HTMLInputElement>('#mainFontColorPicker').value = config.mainText.color;

    // Text size active button
    $$<HTMLButtonElement>('.btn-text-size').forEach((btn) => {
      const size = parseInt(btn.dataset.size || '44', 10);
      btn.classList.toggle('active', config.mainText.size === size);
    });

    // Text effect active button
    $$<HTMLButtonElement>('.btn-text-effect').forEach((btn) => {
      btn.classList.toggle('active', config.mainText.effect === btn.dataset.effect);
    });

    // Sub text
    $<HTMLInputElement>('#subTextInput').value = config.subText.content;
    $<HTMLInputElement>('#subFontColorPicker').value = config.subText.color;
  }
}
