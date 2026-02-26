import { textColumn, keyColumn } from 'react-datasheet-grid';
import type { DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';

// @MX:NOTE: Timeline generator builds timeline syntax with sections and semicolon-separated events per period
function generateTimeline(rows: DiagramRow[], _options: DiagramOptions): string {
  const validRows = rows.filter((r) => r['period'] && r['events']);
  if (validRows.length === 0) return '';

  const lines: string[] = ['timeline'];

  let lastSection: string | null = null;

  for (const row of validRows) {
    const period = row['period'] ?? '';
    const events = row['events'] ?? '';
    const section = row['section'];

    if (section && section !== lastSection) {
      lines.push(`    section ${section}`);
      lastSection = section;
    }

    const eventList = events.split(';').map((e) => e.trim()).filter(Boolean);
    if (eventList.length === 1) {
      lines.push(`    ${period} : ${eventList[0]}`);
    } else if (eventList.length > 1) {
      lines.push(`    ${period} : ${eventList[0]}`);
      for (let i = 1; i < eventList.length; i++) {
        lines.push(`               : ${eventList[i]}`);
      }
    }
  }

  return lines.join('\n');
}

const timelineTemplates: Template[] = [
  {
    id: 'product-roadmap',
    name: '製品ロードマップ',
    description: '製品開発の時系列',
    rows: [
      { section: '2024年 Q1-Q2', period: '2024年1月', events: 'MVP開発開始;チーム編成' },
      { section: '2024年 Q1-Q2', period: '2024年3月', events: 'クローズドベータ;ユーザーテスト' },
      { section: '2024年 Q3-Q4', period: '2024年6月', events: 'v1.0 正式リリース;プレスリリース' },
      { section: '2024年 Q3-Q4', period: '2024年9月', events: 'v1.1 機能追加;バグ修正' },
      { section: '2025年', period: '2025年1月', events: 'v2.0 大型アップデート;API公開' },
      { section: '2025年', period: '2025年6月', events: 'グローバル展開;多言語対応' },
    ],
  },
];

export const timelineConfig: DiagramConfig = {
  id: 'timeline',
  label: 'タイムライン',
  columns: [
    { ...keyColumn<DiagramRow>('section', textColumn), title: 'セクション', minWidth: 120 },
    { ...keyColumn<DiagramRow>('period', textColumn), title: '時期', minWidth: 120 },
    { ...keyColumn<DiagramRow>('events', textColumn), title: 'イベント(;区切り)', minWidth: 200 },
  ],
  createRow: (): DiagramRow => ({
    section: null,
    period: null,
    events: null,
  }),
  generate: generateTimeline,
  templates: timelineTemplates,
};
