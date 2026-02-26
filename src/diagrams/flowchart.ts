import { textColumn, keyColumn } from 'react-datasheet-grid';
import { SelectColumn } from '../components/SelectColumn';
import type { DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';

const TYPE_OPTIONS = [
  { value: 'start', label: '開始' },
  { value: 'task', label: 'タスク' },
  { value: 'decision', label: '分岐' },
  { value: 'end', label: '終了' },
];

const SHAPE_OPTIONS = [
  { value: 'rectangle', label: '長方形' },
  { value: 'rounded', label: '角丸' },
  { value: 'diamond', label: 'ひし形' },
  { value: 'hexagon', label: '六角形' },
  { value: 'cylinder', label: '円柱' },
  { value: 'stadium', label: 'スタジアム' },
  { value: 'circle', label: '円形' },
  { value: 'subroutine', label: 'サブルーチン' },
  { value: 'trapezoid', label: '台形' },
  { value: 'parallelogram', label: '平行四辺形' },
];

const ARROW_OPTIONS = [
  { value: 'solid', label: '実線' },
  { value: 'dotted', label: '点線' },
  { value: 'thick', label: '太線' },
];

function escapeLabel(text: string): string {
  return text.replace(/"/g, '#quot;');
}

function nodeShape(id: string, label: string, shape: string): string {
  const escaped = escapeLabel(label);
  switch (shape) {
    case 'rounded':
      return `${id}("${escaped}")`;
    case 'diamond':
      return `${id}{"${escaped}"}`;
    case 'hexagon':
      return `${id}{{"${escaped}"}}`;
    case 'cylinder':
      return `${id}[("${escaped}")]`;
    case 'stadium':
      return `${id}(["${escaped}"])`;
    case 'circle':
      return `${id}(("${escaped}"))`;
    case 'subroutine':
      return `${id}[["${escaped}"]]`;
    case 'trapezoid':
      return `${id}[/"${escaped}"\\]`;
    case 'parallelogram':
      return `${id}[/"${escaped}"/]`;
    case 'rectangle':
    default:
      return `${id}["${escaped}"]`;
  }
}

function getArrow(arrowType: string | null | undefined): string {
  switch (arrowType) {
    case 'dotted':
      return '-.->';
    case 'thick':
      return '==>';
    default:
      return '-->';
  }
}

function getDefaultShape(type: string | null | undefined): string {
  switch (type) {
    case 'start':
    case 'end':
      return 'stadium';
    case 'decision':
      return 'diamond';
    default:
      return 'rectangle';
  }
}

// @MX:NOTE: Flowchart generator handles swimlanes, subgraphs, node shapes, arrow types, and multi-line notes
function generateFlowchart(rows: DiagramRow[], options: DiagramOptions): string {
  const validRows = rows.filter((r) => r['id'] && r['name']);
  if (validRows.length === 0) return '';

  const lines: string[] = [`flowchart ${options.direction}`];

  // Build node shape map
  const nodeMap = new Map<string, DiagramRow>();
  for (const row of validRows) {
    if (row['id']) nodeMap.set(row['id'], row);
  }

  // Group by swimlane (assignee) when enabled
  if (options.enableSwimlanes) {
    const grouped = new Map<string, DiagramRow[]>();
    const unassigned: DiagramRow[] = [];

    for (const row of validRows) {
      const assignee = row['assignee'];
      if (assignee) {
        const group = grouped.get(assignee) ?? [];
        group.push(row);
        grouped.set(assignee, group);
      } else {
        unassigned.push(row);
      }
    }

    // Group by subgraph within each swimlane
    for (const row of unassigned) {
      const group = row['group'];
      if (!group) {
        lines.push(`    ${buildNodeLine(row)}`);
      }
    }

    // Handle subgraph groups for unassigned
    const unassignedGroups = new Map<string, DiagramRow[]>();
    for (const row of unassigned) {
      const group = row['group'];
      if (group) {
        const g = unassignedGroups.get(group) ?? [];
        g.push(row);
        unassignedGroups.set(group, g);
      }
    }
    for (const [groupName, groupRows] of unassignedGroups) {
      lines.push(`    subgraph ${groupName.replace(/\s+/g, '_')}["${escapeLabel(groupName)}"]`);
      for (const row of groupRows) {
        lines.push(`        ${buildNodeLine(row)}`);
      }
      lines.push('    end');
    }

    for (const [assignee, assigneeRows] of grouped) {
      lines.push(`    subgraph ${assignee.replace(/\s+/g, '_')}["${escapeLabel(assignee)}"]`);
      const assigneeGroups = new Map<string, DiagramRow[]>();
      const directRows: DiagramRow[] = [];
      for (const row of assigneeRows) {
        const group = row['group'];
        if (group) {
          const g = assigneeGroups.get(group) ?? [];
          g.push(row);
          assigneeGroups.set(group, g);
        } else {
          directRows.push(row);
        }
      }
      for (const row of directRows) {
        lines.push(`        ${buildNodeLine(row)}`);
      }
      for (const [groupName, groupRows] of assigneeGroups) {
        lines.push(`        subgraph ${groupName.replace(/\s+/g, '_')}["${escapeLabel(groupName)}"]`);
        for (const row of groupRows) {
          lines.push(`            ${buildNodeLine(row)}`);
        }
        lines.push('        end');
      }
      lines.push('    end');
    }
  } else {
    // Handle subgraphs without swimlanes
    const groups = new Map<string, DiagramRow[]>();
    const noGroup: DiagramRow[] = [];

    for (const row of validRows) {
      const group = row['group'];
      if (group) {
        const g = groups.get(group) ?? [];
        g.push(row);
        groups.set(group, g);
      } else {
        noGroup.push(row);
      }
    }

    for (const row of noGroup) {
      lines.push(`    ${buildNodeLine(row)}`);
    }

    for (const [groupName, groupRows] of groups) {
      lines.push(`    subgraph ${groupName.replace(/\s+/g, '_')}["${escapeLabel(groupName)}"]`);
      for (const row of groupRows) {
        lines.push(`        ${buildNodeLine(row)}`);
      }
      lines.push('    end');
    }
  }

  lines.push('');

  // Build edges
  for (const row of validRows) {
    const fromId = row['id'];
    if (!fromId) continue;
    const nextRaw = row['next'] ?? '';
    if (!nextRaw) continue;
    const targets = nextRaw.split(',').map((s) => s.trim()).filter(Boolean);
    const condition = row['condition'];
    const arrowType = row['arrow'];
    const arrow = getArrow(arrowType);

    for (const target of targets) {
      if (!nodeMap.has(target)) continue;
      if (condition) {
        lines.push(`    ${fromId} ${arrow}|"${escapeLabel(condition)}"| ${target}`);
      } else {
        lines.push(`    ${fromId} ${arrow} ${target}`);
      }
    }
  }

  return lines.join('\n');
}

function buildNodeLine(row: DiagramRow): string {
  const id = row['id'] ?? '';
  const name = row['name'] ?? '';
  const type = row['type'];
  const shape = row['shape'] ?? getDefaultShape(type);
  const notes = row['notes'];
  const label = notes ? `${name}<br/>${notes}` : name;
  return nodeShape(id, label, shape);
}

const flowchartTemplates: Template[] = [
  {
    id: 'approval',
    name: '承認フロー',
    description: '申請→承認/却下の基本フロー',
    rows: [
      { id: 'S1', name: '申請開始', type: 'start', shape: 'stadium', assignee: null, next: 'S2', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'S2', name: '申請書作成', type: 'task', shape: 'rectangle', assignee: null, next: 'S3', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'S3', name: '承認判定', type: 'decision', shape: 'diamond', assignee: null, next: 'S4, S5', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'S4', name: '承認', type: 'task', shape: 'rectangle', assignee: null, next: 'S6', condition: '承認', arrow: 'solid', group: null, notes: null },
      { id: 'S5', name: '却下', type: 'task', shape: 'rectangle', assignee: null, next: 'S6', condition: '却下', arrow: 'solid', group: null, notes: null },
      { id: 'S6', name: '完了', type: 'end', shape: 'stadium', assignee: null, next: '', condition: null, arrow: 'solid', group: null, notes: null },
    ],
  },
  {
    id: 'leave-request',
    name: '休暇申請',
    description: '差し戻しループ付き',
    rows: [
      { id: 'L1', name: '申請開始', type: 'start', shape: 'stadium', assignee: '申請者', next: 'L2', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'L2', name: '休暇申請書記入', type: 'task', shape: 'rectangle', assignee: '申請者', next: 'L3', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'L3', name: '上長確認', type: 'decision', shape: 'diamond', assignee: '上長', next: 'L4, L5', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'L4', name: '承認', type: 'task', shape: 'rectangle', assignee: '上長', next: 'L6', condition: '承認', arrow: 'solid', group: null, notes: null },
      { id: 'L5', name: '差し戻し', type: 'task', shape: 'rectangle', assignee: '上長', next: 'L2', condition: '要修正', arrow: 'dotted', group: null, notes: null },
      { id: 'L6', name: '人事処理', type: 'task', shape: 'rectangle', assignee: '人事', next: 'L7', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'L7', name: '完了', type: 'end', shape: 'stadium', assignee: null, next: '', condition: null, arrow: 'solid', group: null, notes: null },
    ],
  },
  {
    id: 'purchase',
    name: '購買申請',
    description: '複数部署のスイムレーン',
    rows: [
      { id: 'P1', name: '購買依頼', type: 'start', shape: 'stadium', assignee: '依頼部門', next: 'P2', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'P2', name: '見積取得', type: 'task', shape: 'rectangle', assignee: '購買部', next: 'P3', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'P3', name: '金額判定', type: 'decision', shape: 'diamond', assignee: '購買部', next: 'P4, P5', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'P4', name: '部長承認', type: 'task', shape: 'rectangle', assignee: '部長', next: 'P6', condition: '10万円以上', arrow: 'solid', group: null, notes: null },
      { id: 'P5', name: '課長承認', type: 'task', shape: 'rectangle', assignee: '課長', next: 'P6', condition: '10万円未満', arrow: 'solid', group: null, notes: null },
      { id: 'P6', name: '発注処理', type: 'task', shape: 'rectangle', assignee: '購買部', next: 'P7', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'P7', name: '完了', type: 'end', shape: 'stadium', assignee: null, next: '', condition: null, arrow: 'solid', group: null, notes: null },
    ],
  },
  {
    id: 'onboarding',
    name: 'オンボーディング',
    description: '並列タスク',
    rows: [
      { id: 'O1', name: '入社手続き開始', type: 'start', shape: 'stadium', assignee: '人事', next: 'O2, O3, O4', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'O2', name: 'アカウント発行', type: 'task', shape: 'rectangle', assignee: 'IT', next: 'O5', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'O3', name: '備品準備', type: 'task', shape: 'rectangle', assignee: '総務', next: 'O5', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'O4', name: '研修資料準備', type: 'task', shape: 'rectangle', assignee: '人事', next: 'O5', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'O5', name: 'オリエンテーション', type: 'task', shape: 'rectangle', assignee: '人事', next: 'O6', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'O6', name: '完了', type: 'end', shape: 'stadium', assignee: null, next: '', condition: null, arrow: 'solid', group: null, notes: null },
    ],
  },
  {
    id: 'bug-triage',
    name: 'バグトリアージ',
    description: '条件分岐ツリー',
    rows: [
      { id: 'B1', name: 'バグ報告受付', type: 'start', shape: 'stadium', assignee: null, next: 'B2', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'B2', name: '重要度判定', type: 'decision', shape: 'diamond', assignee: null, next: 'B3, B4, B5', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'B3', name: '緊急対応', type: 'task', shape: 'rectangle', assignee: null, next: 'B6', condition: 'Critical', arrow: 'thick', group: null, notes: '24時間以内に対応' },
      { id: 'B4', name: '通常対応', type: 'task', shape: 'rectangle', assignee: null, next: 'B6', condition: 'Major', arrow: 'solid', group: null, notes: null },
      { id: 'B5', name: 'バックログ登録', type: 'task', shape: 'rectangle', assignee: null, next: 'B7', condition: 'Minor', arrow: 'dotted', group: null, notes: null },
      { id: 'B6', name: 'テスト・検証', type: 'task', shape: 'rectangle', assignee: null, next: 'B7', condition: null, arrow: 'solid', group: null, notes: null },
      { id: 'B7', name: '完了', type: 'end', shape: 'stadium', assignee: null, next: '', condition: null, arrow: 'solid', group: null, notes: null },
    ],
  },
];

export const flowchartConfig: DiagramConfig = {
  id: 'flowchart',
  label: 'フローチャート',
  columns: [
    { ...keyColumn<DiagramRow>('id', textColumn), title: 'ID', minWidth: 60, maxWidth: 100 },
    { ...keyColumn<DiagramRow>('name', textColumn), title: 'ステップ名', minWidth: 120 },
    {
      ...keyColumn<DiagramRow>('type', SelectColumn({ options: TYPE_OPTIONS })),
      title: '種別',
      minWidth: 80,
      maxWidth: 100,
    },
    {
      ...keyColumn<DiagramRow>('shape', SelectColumn({ options: SHAPE_OPTIONS })),
      title: '形状',
      minWidth: 90,
      maxWidth: 120,
    },
    { ...keyColumn<DiagramRow>('assignee', textColumn), title: '担当者', minWidth: 80 },
    { ...keyColumn<DiagramRow>('next', textColumn), title: '次ステップ', minWidth: 80 },
    { ...keyColumn<DiagramRow>('condition', textColumn), title: '条件', minWidth: 80 },
    {
      ...keyColumn<DiagramRow>('arrow', SelectColumn({ options: ARROW_OPTIONS })),
      title: '矢印',
      minWidth: 70,
      maxWidth: 90,
    },
    { ...keyColumn<DiagramRow>('group', textColumn), title: 'グループ', minWidth: 80 },
    { ...keyColumn<DiagramRow>('notes', textColumn), title: '備考', minWidth: 100 },
  ],
  createRow: (): DiagramRow => ({
    id: null,
    name: null,
    type: 'task',
    shape: 'rectangle',
    assignee: null,
    next: null,
    condition: null,
    arrow: 'solid',
    group: null,
    notes: null,
  }),
  generate: generateFlowchart,
  templates: flowchartTemplates,
};
