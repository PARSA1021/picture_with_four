import { DEFAULT_CONFIG, FRAME_PRESETS, THEMES } from '../core/constants.ts';
import {
  FrameConfig,
  FramePresetType,
  ImageData,
  LayoutType,
  StickerItem,
  TextConfig,
  TextEffectType,
  ThemeType
} from './types.ts';

type Listener = (config: FrameConfig) => void;
type SelectionListener = () => void;

class FrameStore {
  private config: FrameConfig;
  private listeners: Set<Listener> = new Set();
  private selectionListeners: Set<SelectionListener> = new Set();

  public selectedSlotIndex: number | null = null;
  public selectedPreviewIndex: number | null = null;
  public editingImageIndex: number | null = null;
  public targetUploadSlotIndex: number | null = null;

  constructor() {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }

  public getConfig(): FrameConfig {
    return this.config;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public subscribeSelection(listener: SelectionListener): () => void {
    this.selectionListeners.add(listener);
    return () => this.selectionListeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener(this.config);
    }
  }

  private notifySelection() {
    for (const listener of this.selectionListeners) {
      listener();
    }
  }

  public setLayout(layout: LayoutType) {
    this.config.layout = layout;
    this.notify();
  }

  public setTheme(themeKey: ThemeType) {
    const themeDef = THEMES[themeKey];
    if (!themeDef) return;

    this.config.theme = themeKey;
    this.config.backgroundColor = themeDef.bg;
    this.config.frameColor = themeDef.frame;
    this.config.mainText.color = themeDef.text;
    this.config.subText.color = themeDef.text;
    if (themeKey === 'botanical-eucalyptus') {
      if (this.config.mainText.content === '인생네컷') {
        this.config.mainText.content = 'PIC4U STUDIO';
      }
      this.config.mainText.font = 'Noto Sans KR';
      this.config.mainText.size = 42;
      this.config.mainText.color = '#ffffff';
      this.config.mainText.effect = 'soft-shadow';
      this.config.mainText.y = 0.93;
      this.config.layout = '1x4';
      this.config.frameMargin = 4;
      this.config.imagePadding = 3;
      this.config.imageCornerRadius = 3;
    } else if (themeKey === 'romantic-rose') {
      if (this.config.mainText.content === '인생네컷') {
        this.config.mainText.content = 'PIC4U STUDIO';
      }
      this.config.mainText.font = 'Noto Sans KR';
      this.config.mainText.size = 42;
      this.config.mainText.color = '#ffffff';
      this.config.mainText.effect = 'soft-shadow';
      this.config.mainText.y = 0.93;
      this.config.layout = '1x4';
      this.config.frameMargin = 4;
      this.config.imagePadding = 3;
      this.config.imageCornerRadius = 3;
    } else if (themeKey === 'sky-cloud') {
      if (this.config.mainText.content === '인생네컷') {
        this.config.mainText.content = 'PIC4U STUDIO';
      }
      this.config.mainText.font = 'Noto Sans KR';
      this.config.mainText.size = 42;
      this.config.mainText.color = '#ffffff';
      this.config.mainText.effect = 'soft-shadow';
      this.config.mainText.y = 0.93;
      this.config.layout = '1x4';
      this.config.frameMargin = 4;
      this.config.imagePadding = 3;
      this.config.imageCornerRadius = 3;
    } else if (themeKey === 'pastel-oil') {
      if (this.config.mainText.content === '인생네컷') {
        this.config.mainText.content = 'PIC4U STUDIO';
      }
      this.config.mainText.font = 'Noto Sans KR';
      this.config.mainText.size = 42;
      this.config.mainText.color = '#ffffff';
      this.config.mainText.effect = 'soft-shadow';
      this.config.mainText.y = 0.93;
      this.config.layout = '1x4';
      this.config.frameMargin = 4;
      this.config.imagePadding = 3;
      this.config.imageCornerRadius = 3;
    } else if (themeKey === 'yellow-rose') {
      if (this.config.mainText.content === '인생네컷') {
        this.config.mainText.content = 'PIC4U STUDIO';
      }
      this.config.mainText.font = 'Noto Sans KR';
      this.config.mainText.size = 42;
      this.config.mainText.color = '#ffffff';
      this.config.mainText.effect = 'soft-shadow';
      this.config.mainText.y = 0.93;
      this.config.layout = '1x4';
      this.config.frameMargin = 4;
      this.config.imagePadding = 3;
      this.config.imageCornerRadius = 3;
    } else if (themeKey === 'midnight-aurora') {
      if (this.config.mainText.content === '인생네컷') {
        this.config.mainText.content = 'PIC4U STUDIO';
      }
      this.config.mainText.font = 'Noto Sans KR';
      this.config.mainText.size = 42;
      this.config.mainText.color = '#ffffff';
      this.config.mainText.effect = 'soft-shadow';
      this.config.mainText.y = 0.93;
      this.config.layout = '1x4';
      this.config.frameMargin = 4;
      this.config.imagePadding = 3;
      this.config.imageCornerRadius = 3;
    } else if (themeKey === 'spring-cherry') {
      if (this.config.mainText.content === '인생네컷') {
        this.config.mainText.content = 'PIC4U STUDIO';
      }
      this.config.mainText.font = 'Noto Sans KR';
      this.config.mainText.size = 42;
      this.config.mainText.color = '#ffffff';
      this.config.mainText.effect = 'soft-shadow';
      this.config.mainText.y = 0.93;
      this.config.layout = '1x4';
      this.config.frameMargin = 4;
      this.config.imagePadding = 3;
      this.config.imageCornerRadius = 3;
    } else if (themeKey === 'sunset-lavender') {
      if (this.config.mainText.content === '인생네컷') {
        this.config.mainText.content = 'PIC4U STUDIO';
      }
      this.config.mainText.font = 'Noto Sans KR';
      this.config.mainText.size = 42;
      this.config.mainText.color = '#ffffff';
      this.config.mainText.effect = 'soft-shadow';
      this.config.mainText.y = 0.93;
      this.config.layout = '1x4';
      this.config.frameMargin = 4;
      this.config.imagePadding = 3;
      this.config.imageCornerRadius = 3;
    }

    const filter = themeDef.filter || null;
    this.config.images.forEach((img) => {
      if (img) img.filter = filter;
    });

    this.notify();
  }

  public setFramePreset(presetKey: FramePresetType) {
    const preset = FRAME_PRESETS.find((p) => p.id === presetKey);
    if (!preset) return;

    this.config.preset = presetKey;
    this.config.frameMargin = preset.margin;
    this.config.imagePadding = preset.padding;
    this.config.imageCornerRadius = preset.radius;
    this.notify();
  }

  public setFrameColor(color: string) {
    this.config.frameColor = color;
    this.notify();
  }

  public setBackgroundColor(color: string) {
    this.config.backgroundColor = color;
    this.notify();
  }

  public setFrameMargin(margin: number) {
    this.config.frameMargin = Math.max(0, Math.min(20, margin));
    this.notify();
  }

  public setImagePadding(padding: number) {
    this.config.imagePadding = Math.max(0, Math.min(20, padding));
    this.notify();
  }

  public setImageCornerRadius(radius: number) {
    this.config.imageCornerRadius = Math.max(0, Math.min(50, radius));
    this.notify();
  }

  public updateMainText(updates: Partial<TextConfig>) {
    this.config.mainText = { ...this.config.mainText, ...updates };
    this.notify();
  }

  public updateSubText(updates: Partial<TextConfig>) {
    this.config.subText = { ...this.config.subText, ...updates };
    this.notify();
  }

  public setTextEffect(key: 'mainText' | 'subText', effect: TextEffectType) {
    const textObj = this.config[key];
    textObj.effect = effect;

    if (effect === 'sticker-outline') {
      textObj.strokeWidth = 3;
      textObj.strokeColor = textObj.color === '#ffffff' || textObj.color === '#fafafa' ? '#000000' : '#ffffff';
    } else {
      textObj.strokeWidth = 0;
    }
    this.notify();
  }

  public addImages(newImages: ImageData[]) {
    // If target slot is specified, insert into that slot
    if (this.targetUploadSlotIndex !== null && newImages.length > 0) {
      const targetIdx = this.targetUploadSlotIndex;
      this.targetUploadSlotIndex = null;

      // Ensure array has enough slots
      while (this.config.images.length <= targetIdx) {
        this.config.images.push(undefined as unknown as ImageData);
      }
      this.config.images[targetIdx] = newImages[0];

      // Add any remaining images
      for (let i = 1; i < newImages.length; i++) {
        const nextEmptyIdx = this.config.images.findIndex((img) => !img);
        if (nextEmptyIdx !== -1) {
          this.config.images[nextEmptyIdx] = newImages[i];
        } else {
          this.config.images.push(newImages[i]);
        }
      }
    } else {
      // Regular sequential append
      for (const img of newImages) {
        const nextEmptyIdx = this.config.images.findIndex((item) => !item);
        if (nextEmptyIdx !== -1) {
          this.config.images[nextEmptyIdx] = img;
        } else {
          this.config.images.push(img);
        }
      }
    }
    this.notify();
  }

  public removeImage(index: number) {
    if (index >= 0 && index < this.config.images.length) {
      this.config.images.splice(index, 1);
      if (this.selectedPreviewIndex === index) this.selectedPreviewIndex = null;
      if (this.selectedSlotIndex === index) this.selectedSlotIndex = null;
      this.notify();
      this.notifySelection();
    }
  }

  public clearSlot(index: number) {
    if (index >= 0 && index < this.config.images.length) {
      this.config.images.splice(index, 1);
      if (this.selectedSlotIndex === index) this.selectedSlotIndex = null;
      this.notify();
      this.notifySelection();
    }
  }

  public rotateImage(index: number) {
    const img = this.config.images[index];
    if (img) {
      img.rotation = (img.rotation + 90) % 360;
      this.notify();
    }
  }

  public flipImage(index: number) {
    const img = this.config.images[index];
    if (img) {
      img.flipped = !img.flipped;
      this.notify();
    }
  }

  public updateImageCrop(index: number, crop: { zoom: number; offsetX: number; offsetY: number }) {
    const img = this.config.images[index];
    if (img) {
      img.zoom = crop.zoom;
      img.offsetX = crop.offsetX;
      img.offsetY = crop.offsetY;
      this.notify();
    }
  }

  public swapImages(indexA: number, indexB: number) {
    if (
      indexA >= 0 &&
      indexB >= 0 &&
      indexA < this.config.images.length &&
      indexB < this.config.images.length &&
      indexA !== indexB
    ) {
      const temp = this.config.images[indexA];
      this.config.images[indexA] = this.config.images[indexB];
      this.config.images[indexB] = temp;
      this.notify();
    }
  }

  public shuffleImages() {
    if (this.config.images.length <= 1) return;
    for (let i = this.config.images.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = this.config.images[i];
      this.config.images[i] = this.config.images[j];
      this.config.images[j] = temp;
    }
    this.notify();
  }

  public addSticker(emoji: string) {
    if (this.config.stickers.length >= 20) return;
    const newSticker: StickerItem = {
      id: `stk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      emoji,
      x: 0.2 + (this.config.stickers.length % 5) * 0.15,
      y: 0.2 + Math.floor(this.config.stickers.length / 5) * 0.15,
      size: 36
    };
    this.config.stickers.push(newSticker);
    this.notify();
  }

  public updateSticker(id: string, updates: Partial<StickerItem>) {
    const stk = this.config.stickers.find((s) => s.id === id);
    if (stk) {
      Object.assign(stk, updates);
      this.notify();
    }
  }

  public removeSticker(id: string) {
    this.config.stickers = this.config.stickers.filter((s) => s.id !== id);
    this.notify();
  }

  public clearStickers() {
    this.config.stickers = [];
    this.notify();
  }

  public clearImages() {
    this.config.images = [];
    this.selectedSlotIndex = null;
    this.selectedPreviewIndex = null;
    this.notify();
    this.notifySelection();
  }

  public fullReset() {
    this.config = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    this.selectedSlotIndex = null;
    this.selectedPreviewIndex = null;
    this.targetUploadSlotIndex = null;
    this.notify();
    this.notifySelection();
  }

  public setSelectedSlot(index: number | null) {
    this.selectedSlotIndex = index;
    this.notifySelection();
  }

  public setSelectedPreview(index: number | null) {
    this.selectedPreviewIndex = index;
    this.notifySelection();
  }

  public setEditingImage(index: number | null) {
    this.editingImageIndex = index;
    this.notifySelection();
  }
}

export const store = new FrameStore();
