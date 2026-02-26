<p align="center">
  <h1 align="center">Workflow Visualizer</h1>
  <p align="center">
    Excel-like table UI for creating Mermaid diagrams<br/>
    Mermaidダイアグラムを表形式で作成するデスクトップアプリ
  </p>
  <p align="center">
    <a href="https://github.com/SimWook/workflow-visualizer/releases/latest"><img src="https://img.shields.io/github/v/release/SimWook/workflow-visualizer?style=flat-square" alt="Release"></a>
    <img src="https://img.shields.io/badge/platform-macOS%20%7C%20Windows-blue?style=flat-square" alt="Platform">
    <img src="https://img.shields.io/badge/Tauri-v2-orange?style=flat-square" alt="Tauri v2">
    <img src="https://img.shields.io/github/license/SimWook/workflow-visualizer?style=flat-square" alt="License">
  </p>
</p>

---

**English** | [日本語](#日本語)

## What is this?

Workflow Visualizer is a desktop application that lets you create professional Mermaid diagrams using an intuitive Excel-like spreadsheet interface. No need to memorize Mermaid syntax — just fill in a table and see your diagram rendered in real-time.

### Why?

- **Mermaid syntax is powerful but hard to remember** — this tool lets you focus on content, not syntax
- **Excel/Spreadsheet users** can leverage familiar table editing (copy-paste from Excel works!)
- **Teams** can quickly create flowcharts, sequence diagrams, and more without learning markup
- **Desktop-native** — works offline, fast rendering, no browser required

## Features

### 9 Diagram Types

Every Mermaid diagram type is fully supported through a customized table interface:

| Type | Description | Columns | Templates |
|------|------------|---------|-----------|
| **Flowchart** | Process flows with swimlanes, subgraphs | ID, Name, Type, Shape (10 types), Assignee, Next, Condition, Arrow (3 types), Group, Notes | 5 |
| **Sequence** | API calls, authentication flows | Sender, Receiver, Message, Arrow (6 types), Activation, Note | 2 |
| **State** | State machines with transitions | ID, State, Type (state/choice/fork/join), Next, Trigger, Notes | 1 |
| **Class** | UML class diagrams | Class, Kind, Members (`;` separated), Methods (`;` separated), Related, Relation (7 types) | 1 |
| **ER** | Entity-Relationship diagrams | Entity, Attribute, Type (PK/FK/string/int/...), Related, Cardinality (1:1, 1:N, N:N) | 1 |
| **Gantt** | Project schedules | Section, Task, Status (done/active/crit), Start Date, Duration | 1 |
| **Pie** | Pie charts | Label, Value | 1 |
| **Mindmap** | Hierarchical mind maps | Item, Parent, Shape (6 types) | 1 |
| **Timeline** | Chronological events | Section, Period, Events (`;` separated) | 1 |

### Editor Features

- **Cell editing** — Click any cell to edit, Tab/Enter to navigate
- **Dropdown selects** — Pre-defined options for types, shapes, arrows, relations
- **Row operations** — Add, delete, reorder rows with drag handles
- **Copy-paste** — Paste data directly from Excel, Google Sheets, or any spreadsheet
- **Auto-add rows** — New empty row added automatically when editing the last row
- **Templates** — Load pre-built examples for each diagram type with one click

### Preview & Export

- **Real-time preview** — Diagram updates as you edit the table
- **Theme selection** — Default, Forest, Dark, Neutral
- **SVG export** — Scalable vector graphics
- **PNG export** — Raster image for presentations
- **Code copy** — Copy raw Mermaid code to clipboard
- **Flowchart options** — Direction (top-down / left-right), swimlane toggle

## Download

Download the latest release for your platform:

| Platform | File | Architecture |
|----------|------|-------------|
| **macOS** (Apple Silicon) | `.dmg` | aarch64 |
| **macOS** (Intel) | `.dmg` | x86_64 |
| **Windows** | `.msi` / `.exe` | x86_64 |

👉 [**Download Latest Release**](https://github.com/SimWook/workflow-visualizer/releases/latest)

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| UI Framework | React + TypeScript | 18.3 / 5.6 |
| Build Tool | Vite | 6.4 |
| Desktop Runtime | Tauri (Rust) | 2.x |
| State Management | Zustand | 5.x |
| Table Editor | react-datasheet-grid | 4.11 |
| Diagram Rendering | Mermaid.js | 11.4 |
| Styling | Tailwind CSS | 4.x |
| Icons | Lucide React | 0.469 |

## Installation

### macOS

1. Download `.dmg` from [Releases](https://github.com/SimWook/workflow-visualizer/releases/latest)
2. Open the `.dmg` and drag the app to Applications
3. **Important**: Since the app is not code-signed, macOS Gatekeeper will block it. Run this command to remove the quarantine attribute:

```bash
xattr -cr "/Applications/Workflow Visualizer.app"
```

4. Now you can open the app normally

> If you see **"Workflow Visualizer is damaged and can't be opened"**, this is expected for unsigned apps downloaded from the internet. The `xattr -cr` command above resolves this.

### Windows

1. Download `.msi` or `.exe` from [Releases](https://github.com/SimWook/workflow-visualizer/releases/latest)
2. Run the installer
3. If Windows SmartScreen shows a warning, click "More info" → "Run anyway"

## Development

### Prerequisites

- **Node.js** 18+
- **Rust** toolchain ([rustup.rs](https://rustup.rs/))
- **Platform dependencies** — see [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/)

### Setup

```bash
# Clone the repository
git clone https://github.com/SimWook/workflow-visualizer.git
cd workflow-visualizer

# Install dependencies
npm install
```

### Commands

```bash
# Browser development (no Rust required)
npm run dev

# Desktop app development (hot reload)
npm run tauri:dev

# Production build
npm run tauri:build
```

### Build Output

| Platform | Path |
|----------|------|
| macOS `.app` | `src-tauri/target/release/bundle/macos/Workflow Visualizer.app` |
| macOS `.dmg` | `src-tauri/target/release/bundle/dmg/Workflow Visualizer_*.dmg` |
| Windows `.msi` | `src-tauri/target/release/bundle/msi/Workflow Visualizer_*.msi` |
| Windows `.exe` | `src-tauri/target/release/bundle/nsis/Workflow Visualizer_*.exe` |

> First Rust compile takes 2-3 minutes. Subsequent builds take ~5 seconds.

## Project Structure

```
workflow-visualizer/
├── src/
│   ├── diagrams/              # Diagram type definitions
│   │   ├── types.ts           #   DiagramRow, DiagramConfig interfaces
│   │   ├── index.ts           #   Registry: type → config mapping
│   │   ├── flowchart.ts       #   Flowchart columns, generator, templates
│   │   ├── sequence.ts        #   Sequence diagram
│   │   ├── state.ts           #   State diagram
│   │   ├── class-diagram.ts   #   Class diagram
│   │   ├── er.ts              #   ER diagram
│   │   ├── gantt.ts           #   Gantt chart
│   │   ├── pie.ts             #   Pie chart
│   │   ├── mindmap.ts         #   Mind map
│   │   └── timeline.ts        #   Timeline
│   ├── components/            # React UI components
│   │   ├── DatasheetEditor.tsx #   Excel-like grid editor
│   │   ├── SelectColumn.tsx   #   Reusable dropdown column
│   │   ├── DiagramView.tsx    #   Mermaid preview renderer
│   │   ├── SettingsBar.tsx    #   Diagram type, direction, theme
│   │   ├── TemplateSelector.tsx#  Template dropdown
│   │   ├── CodeView.tsx       #   Raw Mermaid code view
│   │   └── ExportPanel.tsx    #   SVG/PNG export
│   ├── stores/
│   │   └── workflow-store.ts  # Zustand store (rows, diagramType, mermaidCode)
│   ├── hooks/
│   │   ├── useMermaidRenderer.ts  # Mermaid rendering hook
│   │   ├── useClipboard.ts        # Clipboard operations
│   │   └── clipboard-bridge.ts    # Tauri/Web clipboard compatibility
│   └── types/
│       └── workflow.ts        # Shared type definitions
├── src-tauri/                 # Tauri v2 Rust backend
│   ├── tauri.conf.json        #   App config, CSP, window settings
│   ├── Cargo.toml             #   Rust dependencies
│   └── src/lib.rs             #   Plugin registration
└── .github/workflows/
    └── release.yml            # CI/CD: multi-platform release builds
```

### Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Tauri v2 Shell                     │
│  ┌───────────────────────────────────────────────┐  │
│  │              React Application                 │  │
│  │                                                │  │
│  │  ┌──────────┐    ┌───────────┐    ┌────────┐  │  │
│  │  │ Settings │───→│  Zustand   │───→│Mermaid │  │  │
│  │  │   Bar    │    │   Store    │    │Preview │  │  │
│  │  └──────────┘    │            │    └────────┘  │  │
│  │  ┌──────────┐    │  rows[]    │    ┌────────┐  │  │
│  │  │Datasheet │───→│  diagram   │───→│ Code   │  │  │
│  │  │  Editor  │    │  Type      │    │  View  │  │  │
│  │  └──────────┘    │  mermaid   │    └────────┘  │  │
│  │  ┌──────────┐    │  Code      │    ┌────────┐  │  │
│  │  │Template  │───→│            │───→│ Export │  │  │
│  │  │Selector  │    └───────────┘    │ Panel  │  │  │
│  │  └──────────┘         ↑           └────────┘  │  │
│  │                       │                        │  │
│  │              ┌────────┴────────┐               │  │
│  │              │ Diagram Registry │               │  │
│  │              │ (9 configs)      │               │  │
│  │              └─────────────────┘               │  │
│  └───────────────────────────────────────────────┘  │
│  Rust: clipboard-manager, shell plugins              │
└─────────────────────────────────────────────────────┘
```

## CI/CD

Releases are automated via GitHub Actions. Pushing a version tag triggers builds for all platforms:

```bash
# Create a new release
git tag v1.1.0
git push origin v1.1.0
# → GitHub Actions builds macOS (aarch64 + x86_64) and Windows (x86_64)
# → Artifacts uploaded to GitHub Releases automatically
```

## License

MIT

---

<a id="日本語"></a>

## 日本語

### Workflow Visualizer とは？

Workflow Visualizer は、Excelのような表形式のインターフェースで Mermaid ダイアグラムを作成できるデスクトップアプリケーションです。Mermaid の構文を覚える必要はありません。テーブルを入力するだけで、リアルタイムにダイアグラムが描画されます。

### なぜこのツール？

- **Mermaid構文は強力だが覚えにくい** — このツールなら構文ではなく内容に集中できます
- **Excel/スプレッドシートユーザー** — 使い慣れた表編集操作が使えます（Excelからのコピペも対応）
- **チーム利用** — マークアップを学ばなくても、フローチャートやシーケンス図をすぐに作成可能
- **デスクトップネイティブ** — オフラインで動作、高速レンダリング、ブラウザ不要

### 機能一覧

#### 9種類のダイアグラム

| 種類 | 説明 | カラム | テンプレート数 |
|------|------|--------|--------------|
| **フローチャート** | スイムレーン・サブグラフ対応の業務フロー | ID、ステップ名、種別、形状(10種)、担当者、次ステップ、条件、矢印(3種)、グループ、備考 | 5 |
| **シーケンス図** | API呼び出し、認証フロー | 送信元、送信先、メッセージ、矢印(6種)、有効化、メモ | 2 |
| **状態遷移図** | 状態マシンと遷移 | ID、状態名、種別(状態/選択/フォーク/ジョイン)、次の状態、トリガー、備考 | 1 |
| **クラス図** | UMLクラス図 | クラス名、種別、メンバー(;区切り)、メソッド(;区切り)、関連先、関連種別(7種) | 1 |
| **ER図** | エンティティ関連図 | エンティティ、属性名、型(PK/FK/string/int等)、関連先、関連種別(1:1,1:N,N:N) | 1 |
| **ガントチャート** | プロジェクトスケジュール | セクション、タスク名、状態(完了/進行中/重要)、開始日、期間 | 1 |
| **円グラフ** | 割合の可視化 | ラベル、値 | 1 |
| **マインドマップ** | 階層構造の思考整理 | 項目、親項目、形状(6種) | 1 |
| **タイムライン** | 時系列イベント | セクション、時期、イベント(;区切り) | 1 |

#### エディタ機能

- **セル編集** — クリックで編集、Tab/Enterで移動
- **ドロップダウン** — 種別・形状・矢印・関連などの定義済み選択肢
- **行操作** — 行の追加、削除、ドラッグで並び替え
- **コピー＆ペースト** — Excel、Googleスプレッドシートからの貼り付けに対応
- **自動行追加** — 最終行を編集すると新しい空行が自動追加
- **テンプレート** — 各ダイアグラムの実用的なサンプルをワンクリックで読み込み

#### プレビュー＆エクスポート

- **リアルタイムプレビュー** — テーブル編集に合わせて即時描画
- **テーマ切替** — 標準、フォレスト、ダーク、ニュートラル
- **SVGエクスポート** — 高品質なベクター画像
- **PNGエクスポート** — プレゼン用のラスター画像
- **コードコピー** — Mermaidコードをクリップボードにコピー
- **フローチャート設定** — 方向(上→下/左→右)、スイムレーン切替

### ダウンロード

| プラットフォーム | ファイル | アーキテクチャ |
|---------------|---------|-------------|
| **macOS** (Apple Silicon) | `.dmg` | aarch64 |
| **macOS** (Intel) | `.dmg` | x86_64 |
| **Windows** | `.msi` / `.exe` | x86_64 |

👉 [**最新版をダウンロード**](https://github.com/SimWook/workflow-visualizer/releases/latest)

### インストール方法

#### macOS

1. [Releases](https://github.com/SimWook/workflow-visualizer/releases/latest) から `.dmg` をダウンロード
2. `.dmg` を開き、アプリをApplicationsにドラッグ
3. **重要**: コード署名されていないため、macOS Gatekeeper がブロックします。以下のコマンドで隔離属性を解除してください:

```bash
xattr -cr "/Applications/Workflow Visualizer.app"
```

4. これでアプリを通常通り開けます

> **「Workflow Visualizer は壊れているため開けません」** と表示される場合は、インターネットからダウンロードした未署名アプリに対するmacOSの制限です。上記の `xattr -cr` コマンドで解決します。

#### Windows

1. [Releases](https://github.com/SimWook/workflow-visualizer/releases/latest) から `.msi` または `.exe` をダウンロード
2. インストーラーを実行
3. Windows SmartScreen の警告が出たら「詳細情報」→「実行」をクリック

### 開発

#### 前提条件

- **Node.js** 18以上
- **Rust** ツールチェーン ([rustup.rs](https://rustup.rs/))

#### コマンド

```bash
# リポジトリをクローン
git clone https://github.com/SimWook/workflow-visualizer.git
cd workflow-visualizer

# 依存関係のインストール
npm install

# ブラウザ開発サーバー（Rust不要）
npm run dev

# デスクトップアプリ開発（ホットリロード対応）
npm run tauri:dev

# プロダクションビルド
npm run tauri:build
```

> 初回のRustコンパイルには2〜3分かかります。2回目以降は約5秒です。

### リリース方法

バージョンタグをpushすると、GitHub Actionsが全プラットフォーム向けに自動ビルドします:

```bash
git tag v1.1.0
git push origin v1.1.0
# → macOS (aarch64 + x86_64) と Windows (x86_64) が自動ビルド
# → GitHub Releases にアップロード
```

### ライセンス

MIT
