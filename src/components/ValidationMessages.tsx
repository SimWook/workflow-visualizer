import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { useWorkflowStore } from '../stores/workflow-store';
import type { ValidationMessage } from '../types/workflow';

const ICON_MAP: Record<ValidationMessage['level'], typeof AlertCircle> = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLOR_MAP: Record<ValidationMessage['level'], string> = {
  error: 'text-red-600 bg-red-50 border-red-200',
  warning: 'text-amber-600 bg-amber-50 border-amber-200',
  info: 'text-blue-600 bg-blue-50 border-blue-200',
};

export function ValidationMessages() {
  const messages = useWorkflowStore((s) => s.messages);

  if (messages.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 pt-2">
      {messages.map((msg, i) => {
        const Icon = ICON_MAP[msg.level];
        return (
          <div
            key={i}
            className={`flex items-start gap-2 rounded-md border px-3 py-1.5 text-xs ${COLOR_MAP[msg.level]}`}
          >
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{msg.message}</span>
          </div>
        );
      })}
    </div>
  );
}
