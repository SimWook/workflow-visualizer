import { create } from 'zustand';
import type { Direction, MermaidTheme, PreviewTab, ValidationMessage } from '../types/workflow';
import type { DiagramRow, DiagramOptions } from '../diagrams/types';
import type { DiagramType } from '../diagrams/types';
import { diagramRegistry } from '../diagrams/index';

interface WorkflowState {
  rows: DiagramRow[];
  diagramType: DiagramType;
  direction: Direction;
  enableSwimlanes: boolean;
  theme: MermaidTheme;
  mermaidCode: string;
  messages: ValidationMessage[];
  activeTab: PreviewTab;

  setRows: (rows: DiagramRow[]) => void;
  setDiagramType: (type: DiagramType) => void;
  setDirection: (d: Direction) => void;
  setEnableSwimlanes: (v: boolean) => void;
  setTheme: (t: MermaidTheme) => void;
  setActiveTab: (t: PreviewTab) => void;
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
    set({ theme: t });
  },

  setActiveTab: (t) => {
    set({ activeTab: t });
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
