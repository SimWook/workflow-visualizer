import { useWorkflowStore } from '../stores/workflow-store';
import { useMermaidRenderer } from '../hooks/useMermaidRenderer';

export function DiagramView() {
  const mermaidCode = useWorkflowStore((s) => s.mermaidCode);
  const theme = useWorkflowStore((s) => s.theme);

  const { containerRef, error } = useMermaidRenderer(mermaidCode, theme);

  if (!mermaidCode) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        左のテーブルにワークフローを入力するとフロー図が表示されます
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          描画エラー: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-center justify-center overflow-auto p-4">
      <div ref={containerRef} className="mermaid-container" />
    </div>
  );
}
