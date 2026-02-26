import { useLayoutEffect, useRef } from 'react';
import type { CellComponent, Column } from 'react-datasheet-grid';

interface Option {
  value: string;
  label: string;
}

interface SelectColumnOptions {
  options: Option[];
}

export function SelectColumn({
  options,
}: SelectColumnOptions): Partial<Column<string | null, Option[]>> {
  const CellSelect: CellComponent<string | null, Option[]> = (({
    rowData,
    setRowData,
    active,
    focus,
    stopEditing,
    columnData,
  }) => {
    const ref = useRef<HTMLSelectElement>(null);
    const opts = columnData ?? options;

    useLayoutEffect(() => {
      if (focus) {
        ref.current?.focus();
      }
    }, [focus]);

    if (!active) {
      const label = opts.find((o) => o.value === rowData)?.label ?? rowData ?? '';
      return (
        <div className="dsg-select-display">
          {label}
        </div>
      );
    }

    return (
      <select
        ref={ref}
        className="dsg-select"
        value={rowData ?? ''}
        onChange={(e) => {
          setRowData(e.target.value);
          setTimeout(() => stopEditing({ nextRow: false }));
        }}
        onBlur={() => stopEditing({ nextRow: false })}
        style={{ pointerEvents: focus ? 'auto' : 'none' }}
      >
        {opts.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  });

  return {
    component: CellSelect,
    columnData: options,
    disableKeys: true,
    keepFocus: true,
    deleteValue: () => options[0]?.value ?? null,
    copyValue: ({ rowData }) =>
      options.find((o) => o.value === rowData)?.label ?? rowData ?? '',
    pasteValue: ({ value }) => {
      const match = options.find(
        (o) => o.value === value || o.label === value,
      );
      return match ? match.value : options[0]?.value ?? null;
    },
  };
}
