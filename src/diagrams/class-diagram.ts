import { textColumn, keyColumn } from 'react-datasheet-grid';
import { SelectColumn } from '../components/SelectColumn';
import type { DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';

const KIND_OPTIONS = [
  { value: 'class', label: 'クラス' },
  { value: 'interface', label: 'インターフェース' },
  { value: 'abstract', label: '抽象クラス' },
];

const RELATION_OPTIONS = [
  { value: '', label: 'なし' },
  { value: 'inheritance', label: '継承' },
  { value: 'composition', label: 'コンポジション' },
  { value: 'aggregation', label: '集約' },
  { value: 'association', label: '関連' },
  { value: 'dependency', label: '依存' },
  { value: 'realization', label: '実現' },
];

function getRelationArrow(relation: string): string {
  switch (relation) {
    case 'inheritance': return '<|--';
    case 'composition': return '*--';
    case 'aggregation': return 'o--';
    case 'association': return '-->';
    case 'dependency': return '..>';
    case 'realization': return '..|>';
    default: return '--';
  }
}

// @MX:NOTE: Class diagram generator produces classDiagram syntax with members, methods, and relationships
function generateClassDiagram(rows: DiagramRow[], _options: DiagramOptions): string {
  const validRows = rows.filter((r) => r['className']);
  if (validRows.length === 0) return '';

  const lines: string[] = ['classDiagram'];

  // Define classes
  for (const row of validRows) {
    const className = row['className'] ?? '';
    const kind = row['kind'] ?? 'class';
    const members = row['members'];
    const methods = row['methods'];

    if (kind === 'interface') {
      lines.push(`    class ${className} {`);
      lines.push(`        <<interface>>`);
    } else if (kind === 'abstract') {
      lines.push(`    class ${className} {`);
      lines.push(`        <<abstract>>`);
    } else {
      lines.push(`    class ${className} {`);
    }

    if (members) {
      const memberList = members.split(';').map((m) => m.trim()).filter(Boolean);
      for (const member of memberList) {
        lines.push(`        +${member}`);
      }
    }

    if (methods) {
      const methodList = methods.split(';').map((m) => m.trim()).filter(Boolean);
      for (const method of methodList) {
        const methodStr = method.includes('(') ? method : `${method}()`;
        lines.push(`        +${methodStr}`);
      }
    }

    lines.push(`    }`);
  }

  lines.push('');

  // Define relationships
  for (const row of validRows) {
    const className = row['className'] ?? '';
    const relatedTo = row['relatedTo'];
    const relation = row['relation'];

    if (!relatedTo || !relation) continue;

    const arrow = getRelationArrow(relation);
    const targets = relatedTo.split(',').map((s) => s.trim()).filter(Boolean);
    for (const target of targets) {
      lines.push(`    ${className} ${arrow} ${target}`);
    }
  }

  return lines.join('\n');
}

const classTemplates: Template[] = [
  {
    id: 'user-management',
    name: 'ユーザー管理',
    description: 'ユーザー・ロール・権限クラス設計',
    rows: [
      { className: 'User', kind: 'class', members: 'String id;String email;String passwordHash', methods: 'authenticate;updateProfile', relatedTo: 'Role', relation: 'association' },
      { className: 'Role', kind: 'class', members: 'String id;String name', methods: 'getPermissions', relatedTo: 'Permission', relation: 'aggregation' },
      { className: 'Permission', kind: 'class', members: 'String resource;String action', methods: '', relatedTo: null, relation: '' },
      { className: 'AdminUser', kind: 'class', members: 'String adminLevel', methods: 'manageUsers', relatedTo: 'User', relation: 'inheritance' },
      { className: 'IUserRepository', kind: 'interface', members: '', methods: 'findById;save;delete', relatedTo: null, relation: '' },
      { className: 'UserRepository', kind: 'class', members: 'Database db', methods: 'findById;save;delete', relatedTo: 'IUserRepository', relation: 'realization' },
    ],
  },
];

export const classDiagramConfig: DiagramConfig = {
  id: 'class',
  label: 'クラス図',
  columns: [
    { ...keyColumn<DiagramRow>('className', textColumn), title: 'クラス名', minWidth: 120 },
    {
      ...keyColumn<DiagramRow>('kind', SelectColumn({ options: KIND_OPTIONS })),
      title: '種別',
      minWidth: 100,
      maxWidth: 130,
    },
    { ...keyColumn<DiagramRow>('members', textColumn), title: 'メンバー(;区切り)', minWidth: 160 },
    { ...keyColumn<DiagramRow>('methods', textColumn), title: 'メソッド(;区切り)', minWidth: 160 },
    { ...keyColumn<DiagramRow>('relatedTo', textColumn), title: '関連先', minWidth: 100 },
    {
      ...keyColumn<DiagramRow>('relation', SelectColumn({ options: RELATION_OPTIONS })),
      title: '関連種別',
      minWidth: 100,
      maxWidth: 130,
    },
  ],
  createRow: (): DiagramRow => ({
    className: null,
    kind: 'class',
    members: null,
    methods: null,
    relatedTo: null,
    relation: '',
  }),
  generate: generateClassDiagram,
  templates: classTemplates,
};
