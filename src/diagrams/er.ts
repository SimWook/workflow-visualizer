import { textColumn, keyColumn } from 'react-datasheet-grid';
import { SelectColumn } from '../components/SelectColumn';
import type { DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';

const ATTR_TYPE_OPTIONS = [
  { value: 'PK', label: 'PK(主キー)' },
  { value: 'FK', label: 'FK(外部キー)' },
  { value: 'string', label: 'string' },
  { value: 'int', label: 'int' },
  { value: 'float', label: 'float' },
  { value: 'boolean', label: 'boolean' },
  { value: 'date', label: 'date' },
  { value: 'datetime', label: 'datetime' },
  { value: 'text', label: 'text' },
];

const RELATION_OPTIONS = [
  { value: '', label: 'なし' },
  { value: '1-1', label: '1対1' },
  { value: '1-N', label: '1対多' },
  { value: 'N-1', label: '多対1' },
  { value: 'N-N', label: '多対多' },
];

function getErRelation(relation: string): string {
  switch (relation) {
    case '1-1': return '||--||';
    case '1-N': return '||--o{';
    case 'N-1': return '}o--||';
    case 'N-N': return '}o--o{';
    default: return '--';
  }
}

// @MX:NOTE: ER diagram generator groups attributes by entity and builds erDiagram syntax
function generateEr(rows: DiagramRow[], _options: DiagramOptions): string {
  const validRows = rows.filter((r) => r['entity'] && r['attrName']);
  if (validRows.length === 0) return '';

  const lines: string[] = ['erDiagram'];

  // Group attributes by entity
  const entityMap = new Map<string, DiagramRow[]>();
  for (const row of validRows) {
    const entity = row['entity'] ?? '';
    const group = entityMap.get(entity) ?? [];
    group.push(row);
    entityMap.set(entity, group);
  }

  for (const [entity, attrs] of entityMap) {
    lines.push(`    ${entity} {`);
    for (const attr of attrs) {
      const attrName = attr['attrName'] ?? '';
      const attrType = attr['attrType'] ?? 'string';
      if (attrType === 'PK') {
        lines.push(`        string ${attrName} PK`);
      } else if (attrType === 'FK') {
        lines.push(`        string ${attrName} FK`);
      } else {
        lines.push(`        ${attrType} ${attrName}`);
      }
    }
    lines.push(`    }`);
  }

  lines.push('');

  // Build relationships (use first row per entity with relation)
  const relationsAdded = new Set<string>();
  for (const row of validRows) {
    const entity = row['entity'] ?? '';
    const relatedTo = row['relatedTo'];
    const relation = row['relation'];

    if (!relatedTo || !relation) continue;

    const relKey = `${entity}-${relatedTo}`;
    const revKey = `${relatedTo}-${entity}`;
    if (relationsAdded.has(relKey) || relationsAdded.has(revKey)) continue;

    relationsAdded.add(relKey);
    const arrow = getErRelation(relation);
    lines.push(`    ${entity} ${arrow} ${relatedTo} : ""`);
  }

  return lines.join('\n');
}

const erTemplates: Template[] = [
  {
    id: 'user-order',
    name: 'ユーザー・注文管理',
    description: 'ECサイトの基本ER図',
    rows: [
      { entity: 'users', attrName: 'id', attrType: 'PK', relatedTo: 'orders', relation: '1-N' },
      { entity: 'users', attrName: 'email', attrType: 'string', relatedTo: null, relation: '' },
      { entity: 'users', attrName: 'name', attrType: 'string', relatedTo: null, relation: '' },
      { entity: 'users', attrName: 'created_at', attrType: 'datetime', relatedTo: null, relation: '' },
      { entity: 'orders', attrName: 'id', attrType: 'PK', relatedTo: null, relation: '' },
      { entity: 'orders', attrName: 'user_id', attrType: 'FK', relatedTo: 'order_items', relation: '1-N' },
      { entity: 'orders', attrName: 'total_amount', attrType: 'float', relatedTo: null, relation: '' },
      { entity: 'orders', attrName: 'status', attrType: 'string', relatedTo: null, relation: '' },
      { entity: 'orders', attrName: 'ordered_at', attrType: 'datetime', relatedTo: null, relation: '' },
      { entity: 'order_items', attrName: 'id', attrType: 'PK', relatedTo: null, relation: '' },
      { entity: 'order_items', attrName: 'order_id', attrType: 'FK', relatedTo: 'products', relation: 'N-1' },
      { entity: 'order_items', attrName: 'product_id', attrType: 'FK', relatedTo: null, relation: '' },
      { entity: 'order_items', attrName: 'quantity', attrType: 'int', relatedTo: null, relation: '' },
      { entity: 'products', attrName: 'id', attrType: 'PK', relatedTo: null, relation: '' },
      { entity: 'products', attrName: 'name', attrType: 'string', relatedTo: null, relation: '' },
      { entity: 'products', attrName: 'price', attrType: 'float', relatedTo: null, relation: '' },
      { entity: 'products', attrName: 'stock', attrType: 'int', relatedTo: null, relation: '' },
    ],
  },
];

export const erConfig: DiagramConfig = {
  id: 'er',
  label: 'ER図',
  columns: [
    { ...keyColumn<DiagramRow>('entity', textColumn), title: 'エンティティ', minWidth: 110 },
    { ...keyColumn<DiagramRow>('attrName', textColumn), title: '属性名', minWidth: 100 },
    {
      ...keyColumn<DiagramRow>('attrType', SelectColumn({ options: ATTR_TYPE_OPTIONS })),
      title: '型',
      minWidth: 90,
      maxWidth: 120,
    },
    { ...keyColumn<DiagramRow>('relatedTo', textColumn), title: '関連先', minWidth: 100 },
    {
      ...keyColumn<DiagramRow>('relation', SelectColumn({ options: RELATION_OPTIONS })),
      title: '関連種別',
      minWidth: 90,
      maxWidth: 110,
    },
  ],
  createRow: (): DiagramRow => ({
    entity: null,
    attrName: null,
    attrType: 'string',
    relatedTo: null,
    relation: '',
  }),
  generate: generateEr,
  templates: erTemplates,
};
