import { useState, useRef, useCallback, useEffect } from 'react';
import { ZoomIn, ZoomOut, Maximize, RotateCcw } from 'lucide-react';
import { useWorkflowStore } from '../stores/workflow-store';
import { useMermaidRenderer } from '../hooks/useMermaidRenderer';

const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const ZOOM_STEP = 0.15;
const WHEEL_ZOOM_STEP = 0.08;

interface Position {
  x: number;
  y: number;
}

export function DiagramView(): React.ReactElement {
  const mermaidCode = useWorkflowStore((s) => s.mermaidCode);
  const theme = useWorkflowStore((s) => s.theme);

  const { containerRef, error } = useMermaidRenderer(mermaidCode, theme);

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<Position>({ x: 0, y: 0 });
  const positionStartRef = useRef<Position>({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  // ズームをスケール中心にクランプ
  const clampScale = useCallback((s: number): number => {
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));
  }, []);

  const handleZoomIn = useCallback(() => {
    setScale((prev) => clampScale(prev + ZOOM_STEP));
  }, [clampScale]);

  const handleZoomOut = useCallback(() => {
    setScale((prev) => clampScale(prev - ZOOM_STEP));
  }, [clampScale]);

  const handleReset = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  // フィット：SVGをビューポートに合わせる
  const handleFit = useCallback(() => {
    const viewport = viewportRef.current;
    const container = containerRef.current;
    if (!viewport || !container) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    const svgRect = svg.getBoundingClientRect();
    const viewRect = viewport.getBoundingClientRect();

    // 現在のスケールで割って元サイズを取得
    const naturalWidth = svgRect.width / scale;
    const naturalHeight = svgRect.height / scale;

    if (naturalWidth === 0 || naturalHeight === 0) return;

    const padding = 32;
    const scaleX = (viewRect.width - padding) / naturalWidth;
    const scaleY = (viewRect.height - padding) / naturalHeight;
    const fitScale = clampScale(Math.min(scaleX, scaleY));

    setScale(fitScale);
    setPosition({ x: 0, y: 0 });
  }, [containerRef, scale, clampScale]);

  // Ctrl/Cmd + ホイールでズーム
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (e: WheelEvent): void => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -WHEEL_ZOOM_STEP : WHEEL_ZOOM_STEP;
        setScale((prev) => clampScale(prev + delta));
      }
    };

    viewport.addEventListener('wheel', handleWheel, { passive: false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, [clampScale]);

  // ドラッグ開始
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // 中クリックまたは左クリックでドラッグ
      if (e.button !== 0 && e.button !== 1) return;
      setIsDragging(true);
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      positionStartRef.current = { ...position };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [position],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPosition({
        x: positionStartRef.current.x + dx,
        y: positionStartRef.current.y + dy,
      });
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // mermaidCodeが変わったらリセット
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [mermaidCode]);

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

  const scalePercent = Math.round(scale * 100);

  return (
    <div className="relative flex h-full flex-col">
      {/* ズームコントロール */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-lg border border-gray-200 bg-white/90 px-1 py-1 shadow-sm backdrop-blur-sm">
        <button
          onClick={handleZoomOut}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="縮小"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="min-w-[3rem] text-center text-xs tabular-nums text-gray-600">
          {scalePercent}%
        </span>
        <button
          onClick={handleZoomIn}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="拡大"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="mx-0.5 h-4 w-px bg-gray-200" />
        <button
          onClick={handleFit}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="画面にフィット"
        >
          <Maximize className="h-4 w-4" />
        </button>
        <button
          onClick={handleReset}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
          title="リセット (100%)"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* ダイアグラム表示エリア */}
      <div
        ref={viewportRef}
        className="diagram-viewport flex-1 overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="flex h-full w-full items-center justify-center"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <div ref={containerRef} className="mermaid-container" />
        </div>
      </div>
    </div>
  );
}
