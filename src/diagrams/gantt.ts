import { textColumn, keyColumn } from 'react-datasheet-grid';
import { SelectColumn } from '../components/SelectColumn';
import type { DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';

const STATUS_OPTIONS = [
  { value: '', label: '通常' },
  { value: 'done', label: '完了' },
  { value: 'active', label: '進行中' },
  { value: 'crit', label: '重要' },
  { value: 'done, crit', label: '完了(重要)' },
  { value: 'active, crit', label: '進行中(重要)' },
];

// @MX:NOTE: Gantt chart generator groups tasks by section and builds gantt syntax
function generateGantt(rows: DiagramRow[], _options: DiagramOptions): string {
  const validRows = rows.filter((r) => r['taskName'] && r['start'] && r['duration']);
  if (validRows.length === 0) return '';

  const lines: string[] = ['gantt'];
  lines.push('    dateFormat YYYY-MM-DD');
  lines.push('    axisFormat %m/%d');

  // Group by section
  const sectionMap = new Map<string, DiagramRow[]>();
  const noSection: DiagramRow[] = [];

  for (const row of validRows) {
    const section = row['section'];
    if (section) {
      const group = sectionMap.get(section) ?? [];
      group.push(row);
      sectionMap.set(section, group);
    } else {
      noSection.push(row);
    }
  }

  // Emit no-section tasks first
  if (noSection.length > 0) {
    for (const row of noSection) {
      lines.push(`    ${buildTaskLine(row)}`);
    }
  }

  for (const [sectionName, sectionRows] of sectionMap) {
    lines.push(`    section ${sectionName}`);
    for (const row of sectionRows) {
      lines.push(`    ${buildTaskLine(row)}`);
    }
  }

  return lines.join('\n');
}

function buildTaskLine(row: DiagramRow): string {
  const taskName = row['taskName'] ?? '';
  const status = row['status'];
  const start = row['start'] ?? '';
  const duration = row['duration'] ?? '1d';

  const statusPart = status ? `${status}, ` : '';
  return `${taskName} : ${statusPart}${start}, ${duration}`;
}

const ganttTemplates: Template[] = [
  {
    id: 'project-plan',
    name: 'プロジェクト計画',
    description: 'Webアプリ開発スケジュール',
    rows: [
      { section: '要件定義', taskName: 'ヒアリング', status: 'done', start: '2025-01-06', duration: '3d' },
      { section: '要件定義', taskName: '要件書作成', status: 'done', start: '2025-01-09', duration: '4d' },
      { section: '設計', taskName: 'システム設計', status: 'done', start: '2025-01-13', duration: '5d' },
      { section: '設計', taskName: 'DB設計', status: 'active', start: '2025-01-16', duration: '3d' },
      { section: '開発', taskName: 'バックエンド実装', status: 'active, crit', start: '2025-01-20', duration: '10d' },
      { section: '開発', taskName: 'フロントエンド実装', status: '', start: '2025-01-23', duration: '8d' },
      { section: 'テスト', taskName: '単体テスト', status: '', start: '2025-01-31', duration: '5d' },
      { section: 'テスト', taskName: '結合テスト', status: 'crit', start: '2025-02-05', duration: '5d' },
      { section: 'リリース', taskName: 'デプロイ', status: 'crit', start: '2025-02-12', duration: '1d' },
      { section: 'リリース', taskName: '運用開始', status: '', start: '2025-02-13', duration: '1d' },
    ],
  },
];

export const ganttConfig: DiagramConfig = {
  id: 'gantt',
  label: 'ガントチャート',
  columns: [
    { ...keyColumn<DiagramRow>('section', textColumn), title: 'セクション', minWidth: 100 },
    { ...keyColumn<DiagramRow>('taskName', textColumn), title: 'タスク名', minWidth: 140 },
    {
      ...keyColumn<DiagramRow>('status', SelectColumn({ options: STATUS_OPTIONS })),
      title: '状態',
      minWidth: 90,
      maxWidth: 120,
    },
    { ...keyColumn<DiagramRow>('start', textColumn), title: '開始', minWidth: 100 },
    { ...keyColumn<DiagramRow>('duration', textColumn), title: '期間', minWidth: 70 },
  ],
  createRow: (): DiagramRow => ({
    section: null,
    taskName: null,
    status: '',
    start: null,
    duration: null,
  }),
  generate: generateGantt,
  templates: ganttTemplates,
};
