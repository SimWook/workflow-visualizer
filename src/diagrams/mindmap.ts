import { textColumn, keyColumn } from 'react-datasheet-grid';
import { SelectColumn } from '../components/SelectColumn';
import type { DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';

const SHAPE_OPTIONS = [
  { value: '', label: 'デフォルト' },
  { value: 'square', label: '四角形' },
  { value: 'rounded', label: '角丸' },
  { value: 'circle', label: '円形' },
  { value: 'bang', label: 'バン' },
  { value: 'cloud', label: 'クラウド' },
  { value: 'hexagon', label: '六角形' },
];

// @MX:NOTE: Mindmap generator uses parent-child relationships to build indented mindmap syntax
function generateMindmap(rows: DiagramRow[], _options: DiagramOptions): string {
  const validRows = rows.filter((r) => r['item']);
  if (validRows.length === 0) return '';

  const lines: string[] = ['mindmap'];

  // Build a map: item text -> row
  // Parent relationship determines depth
  const itemMap = new Map<string, DiagramRow>();
  for (const row of validRows) {
    if (row['item']) itemMap.set(row['item'], row);
  }

  // Build a tree structure
  interface TreeNode {
    row: DiagramRow;
    children: TreeNode[];
  }

  const roots: TreeNode[] = [];
  const nodeMap = new Map<string, TreeNode>();

  for (const row of validRows) {
    const node: TreeNode = { row, children: [] };
    nodeMap.set(row['item'] ?? '', node);
  }

  for (const row of validRows) {
    const item = row['item'] ?? '';
    const parent = row['parent'];
    const node = nodeMap.get(item);
    if (!node) continue;

    if (!parent || !nodeMap.has(parent)) {
      roots.push(node);
    } else {
      const parentNode = nodeMap.get(parent);
      if (parentNode) parentNode.children.push(node);
    }
  }

  function renderNode(node: TreeNode, depth: number): void {
    const item = node.row['item'] ?? '';
    const shape = node.row['shape'] ?? '';
    const indent = '    '.repeat(depth);

    let itemStr = item;
    switch (shape) {
      case 'square':
        itemStr = `[${item}]`;
        break;
      case 'rounded':
        itemStr = `(${item})`;
        break;
      case 'circle':
        itemStr = `((${item}))`;
        break;
      case 'bang':
        itemStr = `))${item}((`;
        break;
      case 'cloud':
        itemStr = `)${item}(`;
        break;
      case 'hexagon':
        itemStr = `{{${item}}}`;
        break;
      default:
        itemStr = item;
    }

    lines.push(`${indent}${itemStr}`);
    for (const child of node.children) {
      renderNode(child, depth + 1);
    }
  }

  for (const root of roots) {
    renderNode(root, 1);
  }

  return lines.join('\n');
}

const mindmapTemplates: Template[] = [
  {
    id: 'project-planning',
    name: 'プロジェクト企画',
    description: 'プロジェクト計画のマインドマップ',
    rows: [
      { item: 'プロジェクト企画', parent: '', shape: 'circle' },
      { item: '目標', parent: 'プロジェクト企画', shape: '' },
      { item: 'KPI設定', parent: '目標', shape: '' },
      { item: 'ROI試算', parent: '目標', shape: '' },
      { item: 'スケジュール', parent: 'プロジェクト企画', shape: '' },
      { item: 'フェーズ1', parent: 'スケジュール', shape: '' },
      { item: 'フェーズ2', parent: 'スケジュール', shape: '' },
      { item: 'リソース', parent: 'プロジェクト企画', shape: '' },
      { item: '人員配置', parent: 'リソース', shape: '' },
      { item: '予算', parent: 'リソース', shape: '' },
      { item: 'リスク', parent: 'プロジェクト企画', shape: 'bang' },
      { item: '技術リスク', parent: 'リスク', shape: '' },
      { item: 'スケジュールリスク', parent: 'リスク', shape: '' },
    ],
  },
];

export const mindmapConfig: DiagramConfig = {
  id: 'mindmap',
  label: 'マインドマップ',
  columns: [
    { ...keyColumn<DiagramRow>('item', textColumn), title: '項目', minWidth: 160 },
    { ...keyColumn<DiagramRow>('parent', textColumn), title: '親項目', minWidth: 140 },
    {
      ...keyColumn<DiagramRow>('shape', SelectColumn({ options: SHAPE_OPTIONS })),
      title: '形状',
      minWidth: 90,
      maxWidth: 120,
    },
  ],
  createRow: (): DiagramRow => ({
    item: null,
    parent: null,
    shape: '',
  }),
  generate: generateMindmap,
  templates: mindmapTemplates,
};
