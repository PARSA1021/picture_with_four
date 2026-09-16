import { FrameConfig, FramePresetType, LayoutType, ThemeDefinition, ThemeType, FontOption } from '../state/types.ts';
import { getFormattedDate } from '../utils/date.ts';

export const MAX_IMAGES = 6;
export const MAX_IMAGE_SIZE = 2400;
export const EXPORT_WIDTH = 1200;

export const THEMES: Record<ThemeType, ThemeDefinition> = {
  'modern-black': { name: '인크 블랙 (Ink Black)', bg: '#18181b', frame: '#27272a', text: '#fafafa' },
  'clean-white': { name: '스튜디오 화이트 (Studio White)', bg: '#ffffff', frame: '#f8fafc', text: '#18181b' },
  'warm-beige': { name: '웜 샌드 (Warm Sand)', bg: '#fdfbf7', frame: '#f7f2ea', text: '#573d2f' },
  'vintage-film': { name: '세피아 필름 (Sepia Film)', bg: '#e7e3dc', frame: '#ded8ce', text: '#3c3228', filter: 'sepia' },
  'y2k-pink': { name: '블러시 로즈 (Blush Rose)', bg: '#fdf2f8', frame: '#fce7f3', text: '#be185d' },
  'cool-ocean': { name: '마린 틸 (Marine Teal)', bg: '#f0f9ff', frame: '#e0f2fe', text: '#0369a1' },
  'cherry-blossom': { name: '뮤트 핑크 (Muted Pink)', bg: '#fff1f2', frame: '#ffe4e6', text: '#e11d48' },
  'sage-green': { name: '세이지 리프 (Sage Leaf)', bg: '#f2f7f4', frame: '#e2ede6', text: '#166534' },
  'botanical-eucalyptus': { name: '🌿 보태니컬 유칼립투스 (시그니처)', bg: '#54634b', frame: '#f9f9f5', text: '#736551' },
  'romantic-rose': { name: '🌹 로맨틱 핑크 로즈 (시그니처)', bg: '#f8a199', frame: '#fcebee', text: '#ffffff' },
  'sky-cloud': { name: '☁️ 퓨어 스카이 & 뭉게구름 (시그니처)', bg: '#5c97d6', frame: '#e8f4fc', text: '#1c395c' },
  'pastel-oil': { name: '🎨 파스텔 유화 (시그니처 #4)', bg: '#d8cde8', frame: '#f5eefb', text: '#ffffff' }
};

export interface FramePresetMeta {
  id: FramePresetType;
  label: string;
  margin: number;
  padding: number;
  radius: number;
  description: string;
}

export const FRAME_PRESETS: FramePresetMeta[] = [
  { id: 'classic-slim', label: '클래식 슬림', margin: 4, padding: 3, radius: 4, description: '가장 익숙한 4컷 비율' },
  { id: 'polaroid', label: '폴라로이드', margin: 6, padding: 4, radius: 0, description: '클래식 아날로그 페이퍼' },
  { id: 'modern-round', label: '모던 라운드', margin: 5, padding: 4, radius: 16, description: '부드러운 곡선 모서리' },
  { id: 'borderless', label: '보더리스 와이드', margin: 1, padding: 1.5, radius: 2, description: '가득 채운 시네마틱 화각' }
];

export interface LayoutMeta {
  id: LayoutType;
  label: string;
  count: number;
  aspectRatio: number;
  description: string;
}

export const LAYOUTS: LayoutMeta[] = [
  { id: '1x4', label: '클래식 4컷', count: 4, aspectRatio: 2.9, description: '오리지널 세로 4컷 (1x4)' },
  { id: '2x2', label: '스퀘어 4컷', count: 4, aspectRatio: 1.28, description: '정사각 피드 프레임 (2x2)' },
  { id: '1+3', label: '포커스 4컷', count: 4, aspectRatio: 1.8, description: '메인 화각 1컷 + 보조 3컷' },
  { id: '2x3', label: '스토리 6컷', count: 6, aspectRatio: 1.6, description: '다채로운 6가지 모먼트 (2x3)' },
  { id: '3x2', label: '그리드 6컷', count: 6, aspectRatio: 1.25, description: '와이드 6컷 포토북 (3x2)' }
];

export const FONTS: FontOption[] = [
  { val: 'Noto Sans KR', name: '본고딕 (Editorial Sans)' },
  { val: 'Inter', name: 'Inter (Modern Studio)' },
  { val: 'Caveat', name: 'Caveat (Signature Script)' },
  { val: 'Nanum Pen Script', name: '나눔손글씨 (Analog Note)' },
  { val: 'Do Hyeon', name: '도현체 (Bold Poster)' },
  { val: 'Jua', name: '주아체 (Friendly)' },
  { val: 'Permanent Marker', name: '마커체 (Handcrafted)' },
  { val: 'Gothic A1', name: '고딕 A1 (Clean Minimal)' }
];

export const STICKER_PALETTE = ['❤️', '✨', '🍒', '📷', '🍀', '😊', '🎀', '☁️', '💫', '🐱'];

export const DEFAULT_CONFIG: FrameConfig = {
  images: [],
  layout: '1x4',
  theme: 'modern-black',
  preset: 'classic-slim',
  backgroundColor: '#18181b',
  frameColor: '#27272a',
  frameMargin: 4,
  imagePadding: 3,
  imageCornerRadius: 4,
  mainText: {
    content: 'PIC4U STUDIO',
    font: 'Noto Sans KR',
    size: 44,
    color: '#fafafa',
    x: 0.5,
    y: 0.93,
    effect: 'none',
    strokeColor: '#000000',
    strokeWidth: 0
  },
  subText: {
    content: getFormattedDate(),
    font: 'Noto Sans KR',
    size: 20,
    color: '#fafafa',
    x: 0.5,
    y: 0.965,
    effect: 'none'
  },
  stickers: []
};
