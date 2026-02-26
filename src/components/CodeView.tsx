import { Copy, Check } from 'lucide-react';
import { useWorkflowStore } from '../stores/workflow-store';
import { useClipboard } from '../hooks/useClipboard';

export function CodeView() {
  const mermaidCode = useWorkflowStore((s) => s.mermaidCode);
  const { copied, copy } = useClipboard();

  if (!mermaidCode) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Mermaidコードがここに表示されます
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-2">
        <span className="text-xs font-medium text-gray-500">Mermaid コード</span>
        <button
          onClick={() => copy(mermaidCode)}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'コピー済み' : 'コピー'}
        </button>
      </div>
      <pre className="flex-1 overflow-auto bg-gray-900 p-4 text-sm leading-relaxed text-green-400">
        <code>{mermaidCode}</code>
      </pre>
    </div>
  );
}
