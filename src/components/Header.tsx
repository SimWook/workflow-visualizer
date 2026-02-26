import { GitBranch } from 'lucide-react';

export function Header() {
  return (
    <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-6 py-3">
      <GitBranch className="h-6 w-6 text-indigo-600" />
      <h1 className="text-lg font-bold text-gray-900">Workflow Visualizer</h1>
      <span className="text-xs text-gray-400">テーブル入力 → フロー図 自動生成</span>
    </header>
  );
}
