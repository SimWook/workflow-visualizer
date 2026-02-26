import type { Column } from 'react-datasheet-grid';

// Generic row type for all diagram types
export type DiagramRow = Record<string, string | null>;

export type DiagramType =
  | 'flowchart'
  | 'sequence'
  | 'state'
  | 'class'
  | 'er'
  | 'gantt'
  | 'pie'
  | 'mindmap'
  | 'timeline';

export interface Template {
  id: string;
  name: string;
  description: string;
  rows: DiagramRow[];
}

export interface DiagramOptions {
  direction: 'TD' | 'LR';
  enableSwimlanes: boolean;
  theme: string;
}

// @MX:ANCHOR: Core diagram configuration interface consumed by all diagram modules and registry
// @MX:REASON: Central contract point with fan_in >= 9 (one per diagram type)
export interface DiagramConfig {
  id: string;
  label: string;
  columns: Column<DiagramRow>[];
  createRow: () => DiagramRow;
  generate: (rows: DiagramRow[], options: DiagramOptions) => string;
  templates: Template[];
}
