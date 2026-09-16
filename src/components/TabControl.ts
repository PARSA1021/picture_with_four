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
    container.innerHTML = Object.entries(THEMES).map(
      ([key, theme]) => `
      <button type="button" class="choice-card btn-theme" data-theme="${key}" role="radio" aria-checked="false" title="${escapeHtml(theme.name)}">
        <div class="theme-swatch" style="background: ${theme.bg}; border-color: ${theme.frame === '#ffffff' ? '#e2e8f0' : theme.frame};"></div>
        <span class="choice-card-title">${escapeHtml(theme.name)}</span>
      </button>
    `
    ).join('');

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

    marginSlider.addEventListener('input', () => {
      const val = parseInt(marginSlider.value, 10);
      store.setFrameMargin(val);
      $<HTMLElement>('#frameMarginValue').textContent = `${val}%`;
    });

    paddingSlider.addEventListener('input', () => {
      const val = parseInt(paddingSlider.value, 10);
      store.setImagePadding(val);
      $<HTMLElement>('#imagePaddingValue').textContent = `${val}%`;
    });

    radiusSlider.addEventListener('input', () => {
      const val = parseInt(radiusSlider.value, 10);
      store.setImageCornerRadius(val);
      $<HTMLElement>('#imageRadiusValue').textContent = `${val}px`;
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
  }

  private setupTextControls() {
    const mainTextInput = $<HTMLInputElement>('#customTextInput');
    const mainFontSelect = $<HTMLSelectElement>('#mainFontSelector');
    const mainColorInput = $<HTMLInputElement>('#mainFontColorPicker');

    mainTextInput.addEventListener('input', () => {
      store.updateMainText({ content: mainTextInput.value });
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

    // Subtext & Date
    const subTextInput = $<HTMLInputElement>('#subTextInput');
    const subColorInput = $<HTMLInputElement>('#subFontColorPicker');
    const autoDateBtn = document.getElementById('btnAutoDate');

    subTextInput.addEventListener('input', () => {
      store.updateSubText({ content: subTextInput.value });
    });

    subColorInput.addEventListener('input', () => {
      store.updateSubText({ color: subColorInput.value });
    });

    autoDateBtn?.addEventListener('click', () => {
      const today = getFormattedDate();
      subTextInput.value = today;
      store.updateSubText({ content: today });
      showToast('오늘 날짜가 입력되었습니다.');
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
