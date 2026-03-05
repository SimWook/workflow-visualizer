import { create } from 'zustand';
import type { Direction, MermaidTheme, PreviewTab, ValidationMessage } from '../types/workflow';
import type { DiagramRow, DiagramOptions } from '../diagrams/types';
import type { DiagramType } from '../diagrams/types';
import { diagramRegistry } from '../diagrams/index';
import { THEME_DEFAULTS } from '../lib/theme-defaults';

interface WorkflowState {
  rows: DiagramRow[];
  diagramType: DiagramType;
  direction: Direction;
  enableSwimlanes: boolean;
  theme: MermaidTheme;
  mermaidCode: string;
  messages: ValidationMessage[];
  activeTab: PreviewTab;
  diagramBgColor: string;
  isCustomBgColor: boolean;

  setRows: (rows: DiagramRow[]) => void;
  setDiagramType: (type: DiagramType) => void;
  setDirection: (d: Direction) => void;
  setEnableSwimlanes: (v: boolean) => void;
  setTheme: (t: MermaidTheme) => void;
  setActiveTab: (t: PreviewTab) => void;
  setDiagramBgColor: (color: string) => void;
  setIsCustomBgColor: (v: boolean) => void;
  recompute: () => void;
}

function createInitialRows(type: DiagramType): DiagramRow[] {
  const config = diagramRegistry[type];
  return [config.createRow(), config.createRow(), config.createRow()];
}

const INITIAL_TYPE: DiagramType = 'flowchart';

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  rows: createInitialRows(INITIAL_TYPE),
  diagramType: INITIAL_TYPE,
  direction: 'TD',
  enableSwimlanes: false,
  theme: 'default',
  mermaidCode: '',
  messages: [],
  activeTab: 'diagram',
  // @MX:NOTE: テーマ変更時に自動更新される。isCustomBgColor が true の場合はユーザー指定色を維持する。
  diagramBgColor: THEME_DEFAULTS['default'].bg,
  isCustomBgColor: false,

  setRows: (rows) => {
    set({ rows });
    get().recompute();
  },

  setDiagramType: (type) => {
    const newRows = createInitialRows(type);
    set({ diagramType: type, rows: newRows });
    get().recompute();
  },

  setDirection: (d) => {
    set({ direction: d });
    get().recompute();
  },

  setEnableSwimlanes: (v) => {
    set({ enableSwimlanes: v });
    get().recompute();
  },

  setTheme: (t) => {
    const { isCustomBgColor } = get();
    if (isCustomBgColor) {
      set({ theme: t });
    } else {
      set({ theme: t, diagramBgColor: THEME_DEFAULTS[t].bg });
    }
  },

  setActiveTab: (t) => {
    set({ activeTab: t });
  },

  setDiagramBgColor: (color) => {
    set({ diagramBgColor: color });
  },

  setIsCustomBgColor: (v) => {
    set({ isCustomBgColor: v });
    if (!v) {
      const { theme } = get();
      set({ diagramBgColor: THEME_DEFAULTS[theme].bg });
    }
  },

  recompute: () => {
    const { rows, diagramType, direction, enableSwimlanes, theme } = get();
    const options: DiagramOptions = { direction, enableSwimlanes, theme };
    const config = diagramRegistry[diagramType];
    try {
      const mermaidCode = config.generate(rows, options);
      set({ mermaidCode, messages: [] });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ mermaidCode: '', messages: [{ level: 'error', message: msg }] });
    }
  },
}));
