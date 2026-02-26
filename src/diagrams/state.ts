import { textColumn, keyColumn } from 'react-datasheet-grid';
import { SelectColumn } from '../components/SelectColumn';
import type { DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';

const TYPE_OPTIONS = [
  { value: 'state', label: '状態' },
  { value: 'choice', label: '選択' },
  { value: 'fork', label: 'フォーク' },
  { value: 'join', label: 'ジョイン' },
];

function escapeLabel(text: string): string {
  return text.replace(/"/g, "'");
}

// @MX:NOTE: State diagram generator handles start/end states via [*] and composite states
function generateState(rows: DiagramRow[], _options: DiagramOptions): string {
  const validRows = rows.filter((r) => r['id'] && r['stateName']);
  if (validRows.length === 0) return '';

  const lines: string[] = ['stateDiagram-v2'];

  // Build a map from id to stateName to resolve [*] references
  const stateNameMap = new Map<string, string>();
  for (const row of validRows) {
    stateNameMap.set(row['id'] ?? '', row['stateName'] ?? '');
  }

  // Resolve an id to its Mermaid identifier (handles [*] for start/end)
  function resolveId(id: string): string {
    const name = stateNameMap.get(id);
    if (name === '[*]') return '[*]';
    return id;
  }

  // Define states (skip [*] entries as they are Mermaid special syntax)
  for (const row of validRows) {
    const id = row['id'] ?? '';
    const stateName = row['stateName'] ?? '';
    const type = row['type'] ?? 'state';
    const notes = row['notes'];

    if (stateName === '[*]') continue;

    if (type === 'choice') {
      lines.push(`    state ${id} <<choice>>`);
    } else if (type === 'fork') {
      lines.push(`    state ${id} <<fork>>`);
    } else if (type === 'join') {
      lines.push(`    state ${id} <<join>>`);
    } else {
      if (id !== stateName) {
        lines.push(`    state "${escapeLabel(stateName)}" as ${id}`);
      }
      if (notes) {
        lines.push(`    note right of ${id}`);
        lines.push(`        ${escapeLabel(notes)}`);
        lines.push(`    end note`);
      }
    }
  }

  lines.push('');

  // Build transitions
  for (const row of validRows) {
    const id = row['id'] ?? '';
    const stateName = row['stateName'] ?? '';
    const nextState = row['nextState'];
    const trigger = row['trigger'];

    if (!nextState) continue;
    if (stateName === '[*]' && !nextState) continue;

    const fromId = resolveId(id);
    const targets = nextState.split(',').map((s) => s.trim()).filter(Boolean);
    for (const target of targets) {
      const targetId = resolveId(target);
      if (trigger) {
        lines.push(`    ${fromId} --> ${targetId} : ${escapeLabel(trigger)}`);
      } else {
        lines.push(`    ${fromId} --> ${targetId}`);
      }
    }
  }

  return lines.join('\n');
}

const stateTemplates: Template[] = [
  {
    id: 'order-state',
    name: '注文状態遷移',
    description: 'ECサイトの注文ライフサイクル',
    rows: [
      { id: 'start', stateName: '[*]', type: 'state', nextState: 'Pending', trigger: null, notes: null },
      { id: 'Pending', stateName: '注文受付', type: 'state', nextState: 'Processing, Cancelled', trigger: null, notes: null },
      { id: 'Processing', stateName: '処理中', type: 'state', nextState: 'Shipped, Cancelled', trigger: '支払完了', notes: null },
      { id: 'Shipped', stateName: '発送済み', type: 'state', nextState: 'Delivered, Returned', trigger: '発送処理', notes: null },
      { id: 'Delivered', stateName: '配達完了', type: 'state', nextState: 'end', trigger: '受取確認', notes: null },
      { id: 'Cancelled', stateName: 'キャンセル', type: 'state', nextState: 'end', trigger: 'キャンセル', notes: null },
      { id: 'Returned', stateName: '返品', type: 'state', nextState: 'end', trigger: '返品申請', notes: null },
      { id: 'end', stateName: '[*]', type: 'state', nextState: '', trigger: null, notes: null },
    ],
  },
];

export const stateConfig: DiagramConfig = {
  id: 'state',
  label: '状態遷移図',
  columns: [
    { ...keyColumn<DiagramRow>('id', textColumn), title: 'ID', minWidth: 80, maxWidth: 120 },
    { ...keyColumn<DiagramRow>('stateName', textColumn), title: '状態名', minWidth: 120 },
    {
      ...keyColumn<DiagramRow>('type', SelectColumn({ options: TYPE_OPTIONS })),
      title: '種別',
      minWidth: 80,
      maxWidth: 100,
    },
    { ...keyColumn<DiagramRow>('nextState', textColumn), title: '次の状態', minWidth: 100 },
    { ...keyColumn<DiagramRow>('trigger', textColumn), title: 'トリガー', minWidth: 100 },
    { ...keyColumn<DiagramRow>('notes', textColumn), title: '備考', minWidth: 120 },
  ],
  createRow: (): DiagramRow => ({
    id: null,
    stateName: null,
    type: 'state',
    nextState: null,
    trigger: null,
    notes: null,
  }),
  generate: generateState,
  templates: stateTemplates,
};
