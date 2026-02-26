# workflow-visualizer Frontend Architecture Memory

## Project Overview
- React 18 + TypeScript + Vite + Tauri desktop app
- react-datasheet-grid for table UI
- Zustand store (useWorkflowStore)
- Mermaid.js for diagram rendering

## Diagram Module Architecture (post-refactor)
- All diagram types live in `/src/diagrams/`
- Each diagram exports a `DiagramConfig` with: id, label, columns, createRow, generate, templates
- `DiagramRow = Record<string, string | null>` - generic row type for all diagrams
- Registry: `diagramRegistry` in `/src/diagrams/index.ts`
- 9 diagram types: flowchart, sequence, state, class, er, gantt, pie, mindmap, timeline

## Key Files
- `/src/diagrams/types.ts` - shared types (DiagramRow, DiagramType, DiagramConfig, etc.)
- `/src/diagrams/index.ts` - registry and diagramTypes array
- `/src/stores/workflow-store.ts` - Zustand store with diagramType state
- `/src/components/DatasheetEditor.tsx` - uses columns/createRow from diagramRegistry
- `/src/components/TemplateSelector.tsx` - reads templates from diagramRegistry
- `/src/components/SettingsBar.tsx` - has diagram type selector; direction/swimlane only shown for flowchart
- `/src/components/SelectColumn.tsx` - dropdown column helper for react-datasheet-grid

## Deleted Files (replaced by diagram modules)
- `src/lib/grid-to-table.ts`
- `src/lib/workflow-builder.ts`
- `src/lib/mermaid-generator.ts`
- `src/lib/sample-templates.ts`

## Column Pattern
```typescript
keyColumn<DiagramRow>('fieldName', textColumn)
keyColumn<DiagramRow>('fieldName', SelectColumn({ options: [...] }))
```

## SelectColumn Usage
- Import from `../components/SelectColumn`
- Takes `{ options: { value: string; label: string }[] }`
- Returns `Partial<Column<string | null, Option[]>>`

## TypeScript Notes
- `DiagramRow` values are `string | null` (not undefined)
- Row accessor like `row['field']` returns `string | null | undefined` - use `?? ''` or handle undefined
- All helper functions that receive row fields should accept `string | null | undefined`
