import type { MermaidTheme } from '../types/workflow';

export interface ThemeColors {
  bg: string;
  controlBg: string;
  controlText: string;
  controlBorder: string;
}

// @MX:NOTE: テーマごとのデフォルト背景色。ダイアグラムビューとズームコントロールに適用される。
export const THEME_DEFAULTS: Record<MermaidTheme, ThemeColors> = {
  default: {
    bg: '#f9fafb',
    controlBg: 'rgba(255,255,255,0.9)',
    controlText: '#6b7280',
    controlBorder: '#e5e7eb',
  },
  forest: {
    bg: '#f0fdf4',
    controlBg: 'rgba(255,255,255,0.9)',
    controlText: '#4b5563',
    controlBorder: '#d1fae5',
  },
  dark: {
    bg: '#1a1a2e',
    controlBg: 'rgba(30,30,50,0.9)',
    controlText: '#d1d5db',
    controlBorder: '#374151',
  },
  neutral: {
    bg: '#f5f5f5',
    controlBg: 'rgba(255,255,255,0.9)',
    controlText: '#6b7280',
    controlBorder: '#e5e7eb',
  },
};
