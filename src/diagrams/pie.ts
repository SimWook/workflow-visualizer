import { textColumn, keyColumn } from 'react-datasheet-grid';
import type { DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';

// @MX:NOTE: Pie chart generator builds pie diagram syntax from label/value pairs
function generatePie(rows: DiagramRow[], _options: DiagramOptions): string {
  const validRows = rows.filter((r) => r['label'] && r['value']);
  if (validRows.length === 0) return '';

  const lines: string[] = ['pie title 円グラフ'];

  for (const row of validRows) {
    const label = row['label'] ?? '';
    const value = row['value'] ?? '0';
    const numVal = parseFloat(value);
    if (!isNaN(numVal)) {
      lines.push(`    "${label}" : ${numVal}`);
    }
  }

  return lines.join('\n');
}

const pieTemplates: Template[] = [
  {
    id: 'browser-share',
    name: 'ブラウザシェア',
    description: 'ブラウザ市場占有率',
    rows: [
      { label: 'Chrome', value: '65.3' },
      { label: 'Safari', value: '18.9' },
      { label: 'Edge', value: '4.5' },
      { label: 'Firefox', value: '4.1' },
      { label: 'Samsung Internet', value: '2.7' },
      { label: 'Opera', value: '2.2' },
      { label: 'その他', value: '2.3' },
    ],
  },
];

export const pieConfig: DiagramConfig = {
  id: 'pie',
  label: '円グラフ',
  columns: [
    { ...keyColumn<DiagramRow>('label', textColumn), title: 'ラベル', minWidth: 160 },
    { ...keyColumn<DiagramRow>('value', textColumn), title: '値', minWidth: 80 },
  ],
  createRow: (): DiagramRow => ({
    label: null,
    value: null,
  }),
  generate: generatePie,
  templates: pieTemplates,
};
