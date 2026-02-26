import { ClipboardCopy, Code, FileImage, FileDown } from 'lucide-react';
import { useState } from 'react';
import { useWorkflowStore } from '../stores/workflow-store';
import { copyNotionBlock, copyRawMermaid, downloadSvg, downloadPng } from '../lib/export-utils';

type Status = 'idle' | 'success' | 'error';

interface ExportButton {
  label: string;
  description: string;
  icon: typeof ClipboardCopy;
  action: () => Promise<void>;
}

export function ExportPanel() {
  const mermaidCode = useWorkflowStore((s) => s.mermaidCode);
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  function getSvgElement(): SVGElement | null {
    return document.querySelector('.mermaid-container svg');
  }

  function setStatus(key: string, status: Status) {
    setStatuses((prev) => ({ ...prev, [key]: status }));
    if (status === 'success') {
      setTimeout(() => setStatuses((prev) => ({ ...prev, [key]: 'idle' })), 2000);
    }
  }

  const buttons: ExportButton[] = [
    {
      label: 'Notion用コピー',
      description: 'Notionに貼り付け可能なMermaidブロックをコピー',
      icon: ClipboardCopy,
      action: async () => {
        await copyNotionBlock(mermaidCode);
        setStatus('notion', 'success');
      },
    },
    {
      label: 'Mermaidコードをコピー',
      description: '生のMermaidコードをクリップボードにコピー',
      icon: Code,
      action: async () => {
        await copyRawMermaid(mermaidCode);
        setStatus('raw', 'success');
      },
    },
    {
      label: 'SVGダウンロード',
      description: 'SVGファイルとして保存',
      icon: FileDown,
      action: async () => {
        const svg = getSvgElement();
        if (!svg) return;
        downloadSvg(svg);
        setStatus('svg', 'success');
      },
    },
    {
      label: 'PNGダウンロード',
      description: '高解像度(2倍)のPNGファイルとして保存',
      icon: FileImage,
      action: async () => {
        const svg = getSvgElement();
        if (!svg) return;
        await downloadPng(svg);
        setStatus('png', 'success');
      },
    },
  ];

  const keys = ['notion', 'raw', 'svg', 'png'] as const;

  if (!mermaidCode) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        フロー図が生成されるとエクスポートできます
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 p-6">
      <h3 className="text-sm font-semibold text-gray-700">エクスポート</h3>
      <div className="grid gap-3">
        {buttons.map((btn, i) => {
          const key = keys[i]!;
          const status = statuses[key] ?? 'idle';
          const Icon = btn.icon;
          return (
            <button
              key={key}
              onClick={btn.action}
              className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50"
            >
              <Icon className="h-5 w-5 shrink-0 text-indigo-600" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900">{btn.label}</div>
                <div className="text-xs text-gray-500">{btn.description}</div>
              </div>
              {status === 'success' && (
                <span className="text-xs font-medium text-green-600">完了</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
