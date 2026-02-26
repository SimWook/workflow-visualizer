export type Direction = 'TD' | 'LR';

export type MermaidTheme = 'default' | 'forest' | 'dark' | 'neutral';

export type PreviewTab = 'diagram' | 'code' | 'export';

export interface ValidationMessage {
  level: 'error' | 'warning' | 'info';
  message: string;
}
