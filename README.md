# Workflow Visualizer

Excel-like table UI for creating Mermaid diagrams. Tauri v2 desktop app for macOS / Windows.

## Features

- **9 diagram types** supported via table input:
  - Flowchart, Sequence, State, Class, ER, Gantt, Pie, Mindmap, Timeline
- **Excel-like editor** - Cell editing, dropdown select, row add/delete/reorder, copy-paste from spreadsheet
- **Real-time preview** - Mermaid diagram renders as you type
- **Export** - SVG, PNG, Mermaid code copy
- **Templates** - Pre-built templates for each diagram type
- **Japanese UI** - Fully localized interface

## Screenshots

| Table Editor | Diagram Preview |
|-------------|----------------|
| Spreadsheet-style input with dropdowns | Live Mermaid rendering |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite 6 |
| Desktop | Tauri v2 (Rust backend) |
| State | Zustand |
| Grid | react-datasheet-grid |
| Diagrams | Mermaid.js |
| Styling | Tailwind CSS |

## Getting Started

### Prerequisites

- Node.js 18+
- Rust (for Tauri desktop build)

### Development

```bash
# Install dependencies
npm install

# Browser dev server
npm run dev

# Desktop app dev (hot reload)
npm run tauri:dev
```

### Build

```bash
# Production build (generates .app/.dmg on macOS, .exe/.msi on Windows)
npm run tauri:build
```

Build output:
- **macOS**: `src-tauri/target/release/bundle/macos/Workflow Visualizer.app`
- **macOS DMG**: `src-tauri/target/release/bundle/dmg/Workflow Visualizer_1.0.0_aarch64.dmg`
- **Windows**: Requires building on a Windows machine

## Supported Diagram Types

| Type | Columns | Templates |
|------|---------|-----------|
| Flowchart | ID, Name, Type, Shape (10), Assignee, Next, Condition, Arrow (3), Group, Notes | 5 |
| Sequence | Sender, Receiver, Message, Arrow (6), Activation, Note | 2 |
| State | ID, State, Type, Next, Trigger, Notes | 1 |
| Class | Class, Kind, Members, Methods, Related, Relation | 1 |
| ER | Entity, Attribute, Type, Related, Cardinality | 1 |
| Gantt | Section, Task, Status, Start, Duration | 1 |
| Pie | Label, Value | 1 |
| Mindmap | Item, Parent, Shape | 1 |
| Timeline | Section, Period, Events | 1 |

## Project Structure

```
src/
  diagrams/          # Diagram type definitions (columns, generator, templates)
  components/        # React UI components
  stores/            # Zustand state management
  hooks/             # Custom hooks (clipboard, mermaid renderer)
  types/             # TypeScript type definitions
src-tauri/           # Tauri v2 Rust backend
```

## License

MIT
