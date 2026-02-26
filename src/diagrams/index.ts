import { flowchartConfig } from './flowchart';
import { sequenceConfig } from './sequence';
import { stateConfig } from './state';
import { classDiagramConfig } from './class-diagram';
import { erConfig } from './er';
import { ganttConfig } from './gantt';
import { pieConfig } from './pie';
import { mindmapConfig } from './mindmap';
import { timelineConfig } from './timeline';
import type { DiagramType, DiagramConfig } from './types';

// @MX:ANCHOR: Diagram registry is the central lookup for all diagram configurations
// @MX:REASON: Public API boundary consumed by store, editor, template selector, and settings bar
export const diagramRegistry: Record<DiagramType, DiagramConfig> = {
  flowchart: flowchartConfig,
  sequence: sequenceConfig,
  state: stateConfig,
  class: classDiagramConfig,
  er: erConfig,
  gantt: ganttConfig,
  pie: pieConfig,
  mindmap: mindmapConfig,
  timeline: timelineConfig,
};

export const diagramTypes: { value: DiagramType; label: string }[] = [
  { value: 'flowchart', label: 'フローチャート' },
  { value: 'sequence', label: 'シーケンス図' },
  { value: 'state', label: '状態遷移図' },
  { value: 'class', label: 'クラス図' },
  { value: 'er', label: 'ER図' },
  { value: 'gantt', label: 'ガントチャート' },
  { value: 'pie', label: '円グラフ' },
  { value: 'mindmap', label: 'マインドマップ' },
  { value: 'timeline', label: 'タイムライン' },
];

export type { DiagramType, DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';
