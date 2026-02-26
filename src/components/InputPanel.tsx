import { TemplateSelector } from './TemplateSelector';
import { DatasheetEditor } from './DatasheetEditor';
import { ValidationMessages } from './ValidationMessages';

export function InputPanel() {
  return (
    <div className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">ワークフロー定義</h2>
        <TemplateSelector />
      </div>
      <div className="min-h-0 flex-1">
        <DatasheetEditor />
      </div>
      <ValidationMessages />
    </div>
  );
}
