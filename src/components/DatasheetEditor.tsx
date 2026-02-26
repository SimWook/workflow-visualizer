import { useRef, useState, useEffect, useCallback } from 'react';
import {
  DataSheetGrid,
} from 'react-datasheet-grid';
import 'react-datasheet-grid/dist/style.css';
import { useWorkflowStore } from '../stores/workflow-store';
import type { DiagramRow } from '../diagrams/types';
import { diagramRegistry } from '../diagrams/index';

export function DatasheetEditor() {
  const rows = useWorkflowStore((s) => s.rows);
  const setRows = useWorkflowStore((s) => s.setRows);
  const diagramType = useWorkflowStore((s) => s.diagramType);
  const containerRef = useRef<HTMLDivElement>(null);
  const [gridHeight, setGridHeight] = useState(400);

  const config = diagramRegistry[diagramType];

  const updateHeight = useCallback(() => {
    if (containerRef.current) {
      const h = containerRef.current.clientHeight;
      if (h > 0) setGridHeight(h);
    }
  }, []);

  useEffect(() => {
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateHeight]);

  return (
    <div ref={containerRef} className="datasheet-wrapper" style={{ height: '100%', minHeight: 200 }}>
      <DataSheetGrid<DiagramRow>
        key={diagramType}
        value={rows}
        onChange={(newRows) => setRows(newRows as DiagramRow[])}
        columns={config.columns}
        createRow={config.createRow}
        height={gridHeight}
        lockRows={false}
        autoAddRow
      />
    </div>
  );
}
