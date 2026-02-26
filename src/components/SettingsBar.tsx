import { useWorkflowStore } from '../stores/workflow-store';
import type { Direction, MermaidTheme } from '../types/workflow';
import { diagramTypes } from '../diagrams/index';
import type { DiagramType } from '../diagrams/types';

const DIRECTIONS: { value: Direction; label: string }[] = [
  { value: 'TD', label: '上 → 下' },
  { value: 'LR', label: '左 → 右' },
];

const THEMES: { value: MermaidTheme; label: string }[] = [
  { value: 'default', label: '標準' },
  { value: 'forest', label: 'フォレスト' },
  { value: 'dark', label: 'ダーク' },
  { value: 'neutral', label: 'ニュートラル' },
];

export function SettingsBar() {
  const diagramType = useWorkflowStore((s) => s.diagramType);
  const direction = useWorkflowStore((s) => s.direction);
  const enableSwimlanes = useWorkflowStore((s) => s.enableSwimlanes);
  const theme = useWorkflowStore((s) => s.theme);
  const setDiagramType = useWorkflowStore((s) => s.setDiagramType);
  const setDirection = useWorkflowStore((s) => s.setDirection);
  const setEnableSwimlanes = useWorkflowStore((s) => s.setEnableSwimlanes);
  const setTheme = useWorkflowStore((s) => s.setTheme);

  const isFlowchart = diagramType === 'flowchart';

  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-gray-200 bg-gray-50 px-6 py-2 text-sm">
      <label className="flex items-center gap-2">
        <span className="font-medium text-gray-600">図タイプ:</span>
        <select
          value={diagramType}
          onChange={(e) => setDiagramType(e.target.value as DiagramType)}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-indigo-700"
        >
          {diagramTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>

      {isFlowchart && (
        <label className="flex items-center gap-2">
          <span className="font-medium text-gray-600">方向:</span>
          <div className="flex rounded-md border border-gray-300 bg-white">
            {DIRECTIONS.map((d) => (
              <button
                key={d.value}
                onClick={() => setDirection(d.value)}
                className={`px-3 py-1 text-xs transition-colors ${
                  direction === d.value
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                } ${d.value === 'TD' ? 'rounded-l-md' : 'rounded-r-md'}`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </label>
      )}

      {isFlowchart && (
        <label className="flex items-center gap-2">
          <span className="font-medium text-gray-600">スイムレーン:</span>
          <button
            onClick={() => setEnableSwimlanes(!enableSwimlanes)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              enableSwimlanes ? 'bg-indigo-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                enableSwimlanes ? 'translate-x-4.5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </label>
      )}

      <label className="flex items-center gap-2">
        <span className="font-medium text-gray-600">テーマ:</span>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as MermaidTheme)}
          className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs"
        >
          {THEMES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
