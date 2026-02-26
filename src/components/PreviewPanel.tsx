import { Eye, Code, Download } from 'lucide-react';
import { useWorkflowStore } from '../stores/workflow-store';
import type { PreviewTab } from '../types/workflow';
import { DiagramView } from './DiagramView';
import { CodeView } from './CodeView';
import { ExportPanel } from './ExportPanel';

const TABS: { id: PreviewTab; label: string; icon: typeof Eye }[] = [
  { id: 'diagram', label: 'フロー図', icon: Eye },
  { id: 'code', label: 'コード', icon: Code },
  { id: 'export', label: 'エクスポート', icon: Download },
];

export function PreviewPanel() {
  const activeTab = useWorkflowStore((s) => s.activeTab);
  const setActiveTab = useWorkflowStore((s) => s.setActiveTab);

  return (
    <div className="flex h-full flex-col">
      <div className="flex border-b border-gray-200 bg-white px-4">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1">
        {activeTab === 'diagram' && <DiagramView />}
        {activeTab === 'code' && <CodeView />}
        {activeTab === 'export' && <ExportPanel />}
      </div>
    </div>
  );
}
