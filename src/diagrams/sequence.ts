import { textColumn, keyColumn } from 'react-datasheet-grid';
import { SelectColumn } from '../components/SelectColumn';
import type { DiagramConfig, DiagramRow, DiagramOptions, Template } from './types';

const ARROW_OPTIONS = [
  { value: '->>', label: '実線(非同期)' },
  { value: '-->>', label: '点線(非同期)' },
  { value: '-)', label: '実線(開放)' },
  { value: '--)', label: '点線(開放)' },
  { value: '-x', label: '実線(クロス)' },
  { value: '--x', label: '点線(クロス)' },
];

const ACTIVATION_OPTIONS = [
  { value: '', label: 'なし' },
  { value: 'activate', label: '有効化' },
  { value: 'deactivate', label: '無効化' },
];

function escapeLabel(text: string): string {
  return text.replace(/"/g, "'");
}

// @MX:NOTE: Sequence diagram generator builds sequenceDiagram syntax with participants and message arrows
function generateSequence(rows: DiagramRow[], _options: DiagramOptions): string {
  const validRows = rows.filter((r) => r['sender'] && r['receiver'] && r['message']);
  if (validRows.length === 0) return '';

  const lines: string[] = ['sequenceDiagram'];

  // Collect unique participants in order
  const participants: string[] = [];
  const seen = new Set<string>();
  for (const row of validRows) {
    const sender = row['sender'];
    const receiver = row['receiver'];
    if (sender && !seen.has(sender)) { participants.push(sender); seen.add(sender); }
    if (receiver && !seen.has(receiver)) { participants.push(receiver); seen.add(receiver); }
  }

  for (const p of participants) {
    lines.push(`    participant ${p.replace(/\s+/g, '_')} as ${p}`);
  }

  lines.push('');

  for (const row of validRows) {
    const sender = row['sender'] ?? '';
    const receiver = row['receiver'] ?? '';
    const message = row['message'] ?? '';
    const arrow = row['arrow'] ?? '->>';
    const activation = row['activation'];
    const note = row['note'];

    const senderKey = sender.replace(/\s+/g, '_');
    const receiverKey = receiver.replace(/\s+/g, '_');

    lines.push(`    ${senderKey}${arrow}${receiverKey}: ${escapeLabel(message)}`);

    if (activation === 'activate') {
      lines.push(`    activate ${receiverKey}`);
    } else if (activation === 'deactivate') {
      lines.push(`    deactivate ${senderKey}`);
    }

    if (note) {
      lines.push(`    Note over ${senderKey},${receiverKey}: ${escapeLabel(note)}`);
    }
  }

  return lines.join('\n');
}

const sequenceTemplates: Template[] = [
  {
    id: 'api-call',
    name: 'API呼び出し',
    description: 'クライアント→サーバーのAPI通信',
    rows: [
      { sender: 'クライアント', receiver: 'APIゲートウェイ', message: 'POST /api/users', arrow: '->>', activation: 'activate', note: null },
      { sender: 'APIゲートウェイ', receiver: '認証サービス', message: 'トークン検証', arrow: '->>', activation: null, note: null },
      { sender: '認証サービス', receiver: 'APIゲートウェイ', message: '検証結果', arrow: '-->>', activation: null, note: null },
      { sender: 'APIゲートウェイ', receiver: 'ユーザーサービス', message: 'ユーザー作成', arrow: '->>', activation: 'activate', note: null },
      { sender: 'ユーザーサービス', receiver: 'データベース', message: 'INSERT users', arrow: '->>', activation: null, note: null },
      { sender: 'データベース', receiver: 'ユーザーサービス', message: 'OK', arrow: '-->>', activation: null, note: null },
      { sender: 'ユーザーサービス', receiver: 'APIゲートウェイ', message: 'ユーザーデータ', arrow: '-->>', activation: 'deactivate', note: null },
      { sender: 'APIゲートウェイ', receiver: 'クライアント', message: '201 Created', arrow: '-->>', activation: 'deactivate', note: null },
    ],
  },
  {
    id: 'login-auth',
    name: 'ログイン認証',
    description: 'ユーザー認証フロー',
    rows: [
      { sender: 'ユーザー', receiver: 'フロントエンド', message: 'ログインフォーム送信', arrow: '->>', activation: null, note: null },
      { sender: 'フロントエンド', receiver: 'バックエンド', message: 'POST /auth/login', arrow: '->>', activation: 'activate', note: '認証情報を暗号化' },
      { sender: 'バックエンド', receiver: 'DB', message: 'ユーザー検索', arrow: '->>', activation: null, note: null },
      { sender: 'DB', receiver: 'バックエンド', message: 'ユーザー情報', arrow: '-->>', activation: null, note: null },
      { sender: 'バックエンド', receiver: 'バックエンド', message: 'パスワード検証', arrow: '->>', activation: null, note: null },
      { sender: 'バックエンド', receiver: 'フロントエンド', message: 'JWTトークン', arrow: '-->>', activation: 'deactivate', note: null },
      { sender: 'フロントエンド', receiver: 'ユーザー', message: 'ダッシュボードへリダイレクト', arrow: '-->>', activation: null, note: null },
    ],
  },
];

export const sequenceConfig: DiagramConfig = {
  id: 'sequence',
  label: 'シーケンス図',
  columns: [
    { ...keyColumn<DiagramRow>('sender', textColumn), title: '送信元', minWidth: 100 },
    { ...keyColumn<DiagramRow>('receiver', textColumn), title: '送信先', minWidth: 100 },
    { ...keyColumn<DiagramRow>('message', textColumn), title: 'メッセージ', minWidth: 140 },
    {
      ...keyColumn<DiagramRow>('arrow', SelectColumn({ options: ARROW_OPTIONS })),
      title: '矢印種別',
      minWidth: 100,
      maxWidth: 130,
    },
    {
      ...keyColumn<DiagramRow>('activation', SelectColumn({ options: ACTIVATION_OPTIONS })),
      title: '有効化',
      minWidth: 80,
      maxWidth: 100,
    },
    { ...keyColumn<DiagramRow>('note', textColumn), title: 'メモ', minWidth: 120 },
  ],
  createRow: (): DiagramRow => ({
    sender: null,
    receiver: null,
    message: null,
    arrow: '->>',
    activation: '',
    note: null,
  }),
  generate: generateSequence,
  templates: sequenceTemplates,
};
