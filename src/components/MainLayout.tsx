import { InputPanel } from './InputPanel';
import { PreviewPanel } from './PreviewPanel';

export function MainLayout() {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-2">
      <div className="min-h-0 border-b border-gray-200 md:border-r md:border-b-0">
        <InputPanel />
      </div>
      <div className="min-h-0">
        <PreviewPanel />
      </div>
    </div>
  );
}
