import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useWorkflowStore } from '../stores/workflow-store';
import { diagramRegistry } from '../diagrams/index';

export function TemplateSelector() {
  const setRows = useWorkflowStore((s) => s.setRows);
  const diagramType = useWorkflowStore((s) => s.diagramType);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const templates = diagramRegistry[diagramType].templates;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (templates.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
      >
        テンプレート選択
        <ChevronDown className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute left-0 z-10 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setRows([...t.rows]);
                setOpen(false);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-indigo-50"
            >
              <span className="font-medium text-gray-900">{t.name}</span>
              <span className="ml-2 text-xs text-gray-500">{t.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
