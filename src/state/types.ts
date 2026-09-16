export type LayoutType = '1x4' | '2x2' | '1+3' | '2x3' | '3x2';

export type ThemeType =
  | 'modern-black'
  | 'clean-white'
  | 'warm-beige'
  | 'vintage-film'
  | 'y2k-pink'
  | 'cool-ocean'
  | 'cherry-blossom'
  | 'sage-green';

export type FramePresetType = 'classic-slim' | 'polaroid' | 'modern-round' | 'borderless';

export type TextEffectType = 'none' | 'soft-shadow' | 'sticker-outline';

export interface ThemeDefinition {
  name: string;
  bg: string;
  frame: string;
  text: string;
  filter?: 'sepia' | null;
}

export interface FontOption {
  val: string;
  name: string;
}

export interface TextConfig {
  content: string;
  font: string;
  size: number;
  color: string;
  x: number; // 0.0 - 1.0
  y: number; // 0.0 - 1.0
  effect: TextEffectType;
  strokeColor?: string;
  strokeWidth?: number;
}

export interface StickerItem {
  id: string;
  emoji: string;
  x: number; // 0.0 - 1.0
  y: number; // 0.0 - 1.0
  size: number; // in px on base 400px width
}

export interface ImageData {
  id: string;
  image: HTMLImageElement;
  src: string;
  flipped: boolean;
  rotation: number; // 0, 90, 180, 270
  filter: string | null;
  zoom: number; // 50 - 200 (%)
  offsetX: number;
  offsetY: number;
}

export interface LayoutSlot {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FrameConfig {
  images: ImageData[];
  layout: LayoutType;
  theme: ThemeType;
  preset: FramePresetType;
  backgroundColor: string;
  frameColor: string;
  frameMargin: number; // 0 - 20 (%)
  imagePadding: number; // 0 - 20 (%)
  imageCornerRadius: number; // 0 - 50 (px)
  mainText: TextConfig;
  subText: TextConfig;
  stickers: StickerItem[];
}

export interface EditState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}
