# DocBuilder - Baseline Specification Document

> **Version:** 1.0.0
> **Last Updated:** 2026-01-12
> **Status:** Authoritative Baseline

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Data Models](#5-data-models)
6. [User Interface Components](#6-user-interface-components)
7. [User Flows](#7-user-flows)
8. [API Integration](#8-api-integration)
9. [Database Schema](#9-database-schema)
10. [Features Specification](#10-features-specification)
11. [Export Formats](#11-export-formats)
12. [Accessibility](#12-accessibility)
13. [Security](#13-security)
14. [Dependencies](#14-dependencies)
15. [Changelog](#15-changelog)

---

## 1. Executive Summary

**DocBuilder** is a professional PDF template builder application that enables users to create, edit, and generate PDF documents through an intuitive drag-and-drop interface. The application supports dynamic fields for API-driven document generation, multi-page documents, presentations, and exports to multiple formats.

### Key Capabilities

- Drag-and-drop document editor with 24 element types
- Multi-page document and presentation support
- Dynamic field placeholders for API integration
- Export to PDF, PNG, JPG, SVG, and PPTX formats
- Cloud storage via Supabase with webhook notifications
- Comprehensive styling system with presets
- Drawing and annotation tools
- Form field support
- Full keyboard accessibility

---

## 2. Architecture Overview

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
├─────────────────────────────────────────────────────────────────┤
│  React 18 + TypeScript + Vite                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Pages      │  │  Components  │  │    Hooks     │          │
│  │  - Index     │  │  - Editor/*  │  │ - useEditor  │          │
│  │  - Editor    │  │  - UI/*      │  │   State      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│           │                │                │                    │
│           └────────────────┼────────────────┘                    │
│                            ▼                                     │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              State Management (useEditorState)           │    │
│  │  - Template CRUD    - Element Operations                 │    │
│  │  - Page Management  - Undo/Redo History                  │    │
│  │  - Drawing Mode     - Clipboard                          │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                     │
│           ┌────────────────┼────────────────┐                    │
│           ▼                ▼                ▼                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  localStorage │  │  Supabase    │  │   Export     │          │
│  │  (Templates)  │  │  Client      │  │   Services   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Edge Function: template-sync                 │   │
│  │  - GET /list     - List all templates                     │   │
│  │  - GET /get      - Get template by ID                     │   │
│  │  - POST /create  - Create template                        │   │
│  │  - POST /update  - Update template                        │   │
│  │  - POST /delete  - Delete template                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   PostgreSQL Database                     │   │
│  │                   Table: templates                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Webhook Notifications                   │   │
│  │  - template.created                                       │   │
│  │  - template.updated                                       │   │
│  │  - template.deleted                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Component Hierarchy

```
App.tsx
├── QueryClientProvider (TanStack Query)
├── TooltipProvider (Radix UI)
├── Toaster (sonner)
└── BrowserRouter
    ├── Route: "/" → Index.tsx (Landing Page)
    ├── Route: "/editor" → Editor.tsx
    │   ├── EditorToolbar
    │   ├── Secondary Toolbar (panels, export, drawing)
    │   ├── Main Layout
    │   │   ├── TemplatesSidebar (collapsible)
    │   │   ├── Left Panel (tabbed)
    │   │   │   ├── ElementsPalette
    │   │   │   ├── LayersPanel
    │   │   │   ├── PagesPanel
    │   │   │   └── StylePresetsPanel
    │   │   ├── EditorCanvas (center)
    │   │   │   └── CanvasElement (per element)
    │   │   └── PropertiesPanel (right)
    │   └── Dialogs
    │       ├── PreviewPanel
    │       ├── ExportDialog
    │       ├── DocumentPropertiesDialog
    │       ├── KeyboardShortcutsDialog
    │       └── TemplateExportDialog
    └── Route: "*" → NotFound.tsx
```

---

## 3. Technology Stack

### 3.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.6.2 | Type Safety |
| Vite | 5.4.19 | Build Tool |
| React Router | 6.30.1 | Client Routing |
| TanStack Query | 5.83.0 | Server State |
| Tailwind CSS | 3.4.17 | Styling |
| Radix UI | Various | Accessible Components |
| shadcn/ui | Latest | Component Library |

### 3.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Supabase | 2.90.1 | Database & Auth |
| Deno | Latest | Edge Functions |
| PostgreSQL | 15+ | Database |

### 3.3 Export Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| pptxgenjs | 4.0.1 | PowerPoint Export |
| docx | 9.5.1 | Word Document Support |

---

## 4. Project Structure

```
document-weaver-pro/
├── src/
│   ├── components/
│   │   ├── editor/                 # Editor-specific components
│   │   │   ├── EditorToolbar.tsx
│   │   │   ├── EditorCanvas.tsx
│   │   │   ├── CanvasElement.tsx
│   │   │   ├── PropertiesPanel.tsx
│   │   │   ├── LayersPanel.tsx
│   │   │   ├── PagesPanel.tsx
│   │   │   ├── ElementsPalette.tsx
│   │   │   ├── StylePresetsPanel.tsx
│   │   │   ├── DrawingToolbar.tsx
│   │   │   ├── DrawingCanvas.tsx
│   │   │   ├── ExportDialog.tsx
│   │   │   ├── PreviewPanel.tsx
│   │   │   ├── DocumentPropertiesDialog.tsx
│   │   │   ├── KeyboardShortcutsDialog.tsx
│   │   │   ├── TemplatesSidebar.tsx
│   │   │   ├── TemplateExportDialog.tsx
│   │   │   └── GradientPicker.tsx
│   │   └── ui/                     # shadcn/ui components (70+ files)
│   ├── pages/
│   │   ├── Index.tsx               # Landing page
│   │   ├── Editor.tsx              # Main editor
│   │   └── NotFound.tsx            # 404 page
│   ├── hooks/
│   │   ├── useEditorState.ts       # Central state management
│   │   ├── useKeyboardNavigation.ts
│   │   ├── useAnnouncer.ts         # A11y announcements
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/
│   │   ├── templateService.ts      # Template logic
│   │   ├── templateExporter.ts     # Export functions
│   │   ├── templateImporter.ts     # Import functions
│   │   ├── templateStorage.ts      # localStorage
│   │   └── utils.ts                # Utilities
│   ├── services/
│   │   └── pptx/
│   │       └── PptxExportService.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       └── types.ts
│   ├── types/
│   │   └── editor.ts               # Type definitions
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── supabase/
│   ├── config.toml
│   ├── functions/
│   │   └── template-sync/
│   │       └── index.ts
│   └── migrations/
│       └── *.sql
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

---

## 5. Data Models

### 5.1 Core Types

#### ElementType (24 types)

```typescript
type ElementType =
  // Basic
  | 'text' | 'image' | 'table' | 'shape' | 'divider'
  // Layout
  | 'header' | 'footer' | 'signature' | 'dynamic-field'
  | 'list' | 'icon' | 'barcode' | 'page-number' | 'watermark' | 'date'
  // Form Fields
  | 'form-text' | 'form-checkbox' | 'form-radio'
  | 'form-dropdown' | 'form-signature'
  // Annotations
  | 'annotation-comment' | 'annotation-note'
  | 'annotation-stamp' | 'annotation-highlight'
  // Advanced
  | 'drawing';
```

#### DocumentElement

```typescript
interface DocumentElement {
  id: string;
  type: ElementType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: ElementStyle;
  content?: string;
  imageUrl?: string;
  imageFilters?: ImageFilters;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  rotation?: number;
  zIndex?: number;
  tableData?: TableData;
  shapeType?: ShapeType;
  shapeFilled?: boolean;
  listType?: ListType;
  listItems?: string[];
  barcodeType?: BarcodeType;
  barcodeValue?: string;
  dynamicField?: string;
  watermarkPattern?: 'single' | 'tiled';
  watermarkOpacity?: number;
  locked?: boolean;
  visible?: boolean;
  formField?: FormFieldProperties;
  annotation?: AnnotationProperties;
  drawingPaths?: DrawingPath[];
  layerName?: string;
  groupId?: string;
}
```

#### Template

```typescript
interface Template {
  id: string;
  name: string;
  description?: string;
  elements: DocumentElement[];
  pages?: Page[];
  currentPageIndex?: number;
  pageSize: 'A4' | 'Letter' | 'Legal' | 'Custom';
  customPageSize?: Size;
  orientation: 'portrait' | 'landscape';
  createdAt: Date;
  updatedAt: Date;
  sourceApp?: string;
  layoutType: 'document' | 'presentation';
  slideProperties?: SlideProperties;
  documentProperties?: DocumentProperties;
  exportSettings?: ExportSettings;
}
```

#### Page (Multi-page support)

```typescript
interface Page {
  id: string;
  name: string;
  elements: DocumentElement[];
  backgroundColor?: string;
  rotation?: 0 | 90 | 180 | 270;
}
```

### 5.2 Styling System

#### ElementStyle

```typescript
interface ElementStyle {
  // Typography
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number;
  wordSpacing?: number;
  lineHeight?: number;
  textIndent?: number;
  columnCount?: number;
  columnGap?: number;

  // Colors
  color?: string;
  backgroundColor?: string;
  gradient?: Gradient;

  // Borders
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  border?: BorderStyle;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  strokeWidth?: number;
  strokeColor?: string;

  // Spacing
  padding?: number;
  margin?: number;

  // Effects
  opacity?: number;
  boxShadow?: BoxShadow;

  // Links
  linkUrl?: string;
}
```

#### Supporting Types

```typescript
interface Gradient {
  type: 'linear' | 'radial';
  angle?: number;
  stops: GradientStop[];
}

interface BoxShadow {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
}

type ShapeType = 'rectangle' | 'circle' | 'ellipse' | 'triangle'
  | 'diamond' | 'pentagon' | 'hexagon' | 'star' | 'arrow' | 'line';

type BarcodeType = 'qr' | 'code128' | 'code39' | 'ean13' | 'upc';

type StampType = 'approved' | 'rejected' | 'draft'
  | 'confidential' | 'final' | 'custom';
```

### 5.3 Editor State

```typescript
interface EditorState {
  currentTemplate: Template | null;
  selectedElementId: string | null;
  selectedElementIds: string[];
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  clipboard: DocumentElement[];
  copiedStyle?: ElementStyle;
  undoStack: EditorState[];
  redoStack: EditorState[];
  isDrawingMode?: boolean;
  currentDrawingTool?: DrawingTool;
  drawingColor?: string;
  drawingWidth?: number;
  currentPageId?: string;
  activePanel?: 'elements' | 'layers' | 'styles' | 'pages';
}
```

---

## 6. User Interface Components

### 6.1 Editor Components

| Component | File | Purpose | Size |
|-----------|------|---------|------|
| EditorToolbar | `EditorToolbar.tsx` | Top toolbar with file/edit actions | ~100 lines |
| EditorCanvas | `EditorCanvas.tsx` | Main canvas rendering area | ~2.8 KB |
| CanvasElement | `CanvasElement.tsx` | Individual element renderer | ~24 KB |
| PropertiesPanel | `PropertiesPanel.tsx` | Right-side properties editor | ~51 KB |
| LayersPanel | `LayersPanel.tsx` | Layer management | ~9.8 KB |
| PagesPanel | `PagesPanel.tsx` | Multi-page management | ~7.2 KB |
| ElementsPalette | `ElementsPalette.tsx` | Element creation panel | ~9 KB |
| StylePresetsPanel | `StylePresetsPanel.tsx` | Style preset library | ~8.8 KB |
| DrawingToolbar | `DrawingToolbar.tsx` | Drawing mode controls | ~5.5 KB |
| DrawingCanvas | `DrawingCanvas.tsx` | Drawing overlay | ~5.4 KB |
| ExportDialog | `ExportDialog.tsx` | Export options modal | ~8.5 KB |
| PreviewPanel | `PreviewPanel.tsx` | Document preview | ~6.9 KB |
| GradientPicker | `GradientPicker.tsx` | Gradient editor | ~8.5 KB |

### 6.2 UI Components (shadcn/ui)

70+ reusable components including:
- Accordion, Alert, Avatar, Badge, Button
- Card, Carousel, Checkbox, Collapsible
- Dialog, Drawer, Dropdown Menu
- Form, Input, Label, Popover
- Select, Sheet, Slider, Switch
- Table, Tabs, Textarea, Toast, Tooltip

---

## 7. User Flows

### 7.1 Landing Page Flow

```
┌─────────────────┐
│   User Visits   │
│   Landing (/)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   View Hero     │
│   Section       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Browse Features│
│  & Capabilities │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Click "Open    │
│  Editor" CTA    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Navigate to    │
│  /editor        │
└─────────────────┘
```

### 7.2 Document Creation Flow

```
┌─────────────────┐
│  Enter Editor   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  New Document   │────▶│  Select Size    │
│  or Presentation│     │  A4/Letter/etc  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  Load Existing  │     │  Select         │
│  Template       │     │  Orientation    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
         ┌─────────────────┐
         │  Canvas Ready   │
         │  for Editing    │
         └────────┬────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌───────┐   ┌───────────┐   ┌───────┐
│ Add   │   │  Modify   │   │Export │
│Element│   │  Existing │   │ Save  │
└───┬───┘   └─────┬─────┘   └───┬───┘
    │             │             │
    ▼             ▼             ▼
┌───────┐   ┌───────────┐   ┌───────┐
│Palette│   │Properties │   │Dialog │
│Select │   │  Panel    │   │Options│
└───────┘   └───────────┘   └───────┘
```

### 7.3 Element Editing Flow

```
┌─────────────────┐
│  Select Element │
│  on Canvas      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Properties Panel│
│   Activated     │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    │         │            │            │
    ▼         ▼            ▼            ▼
┌───────┐ ┌───────┐   ┌───────┐   ┌───────┐
│ Style │ │Position│   │Content│   │Actions│
│Changes│ │ & Size │   │ Edit  │   │Toolbar│
└───┬───┘ └───┬───┘   └───┬───┘   └───┬───┘
    │         │           │           │
    │         │           │           │
    └─────────┴─────┬─────┴───────────┘
                    │
                    ▼
         ┌─────────────────┐
         │ Element Updated │
         │ Auto-save to    │
         │ Undo Stack      │
         └─────────────────┘
```

### 7.4 Export Flow

```
┌─────────────────┐
│ Click Export    │
│ (Ctrl+E)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Export Dialog  │
│    Opens        │
└────────┬────────┘
         │
    ┌────┴────────────┐
    │                 │
    ▼                 ▼
┌───────────┐   ┌───────────┐
│  Select   │   │  Configure│
│  Format   │   │  Options  │
│PDF/PNG/etc│   │Quality/DPI│
└─────┬─────┘   └─────┬─────┘
      │               │
      └───────┬───────┘
              │
              ▼
    ┌─────────────────┐
    │  Generate &     │
    │  Download       │
    └─────────────────┘
```

### 7.5 API Integration Flow

```
┌─────────────────┐
│ External App    │
│ Sends Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Edge Function   │
│ Validates Key   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌───────┐
│ Valid │  │Invalid│
│  Key  │  │  Key  │
└───┬───┘  └───┬───┘
    │          │
    ▼          ▼
┌───────┐  ┌───────┐
│Process│  │ 401   │
│Request│  │ Error │
└───┬───┘  └───────┘
    │
    ▼
┌─────────────────┐
│ Database CRUD   │
│ Operation       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send Webhook    │
│ Notification    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Return Response │
│ to Client       │
└─────────────────┘
```

---

## 8. API Integration

### 8.1 Edge Function Endpoints

**Base URL:** `https://<project-id>.supabase.co/functions/v1/template-sync`

#### Authentication

All requests require the `X-Sync-Key` header:

```
X-Sync-Key: <DOCBUILDER_SYNC_KEY>
```

#### GET Endpoints

| Endpoint | Description | Parameters |
|----------|-------------|------------|
| `?action=list` | List all templates | None |
| `?action=get&id={uuid}` | Get single template | `id`: Template UUID |

#### POST Endpoints

| Action | Description | Body |
|--------|-------------|------|
| `create` | Create template | `{ action: "create", template: TemplatePayload }` |
| `update` | Update template | `{ action: "update", template: TemplatePayload }` |
| `delete` | Delete template | `{ action: "delete", id: string }` |

### 8.2 Template Payload

```typescript
interface TemplatePayload {
  id?: string;
  name: string;
  description?: string;
  elements: DocumentElement[];
  pageSize?: string;
  orientation?: string;
  layoutType?: string;
  sourceApp?: string;
  externalId?: string;
  metadata?: Record<string, any>;
}
```

### 8.3 Webhook Events

When templates are modified, webhooks are sent to `DOCBUILDER_WEBHOOK_URL`:

```typescript
interface WebhookPayload {
  event: 'template.created' | 'template.updated' | 'template.deleted';
  timestamp: string;
  template: any;
  source: 'docbuilder';
}
```

### 8.4 Response Format

```typescript
// Success
{
  success: true,
  data: { ... }
}

// Error
{
  success: false,
  error: "Error message"
}
```

---

## 9. Database Schema

### 9.1 Templates Table

```sql
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  elements JSONB NOT NULL DEFAULT '[]',
  page_size TEXT NOT NULL DEFAULT 'A4',
  orientation TEXT NOT NULL DEFAULT 'portrait',
  layout_type TEXT NOT NULL DEFAULT 'document',
  source_app TEXT,
  external_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### 9.2 Indexes

```sql
CREATE INDEX idx_templates_external_id ON public.templates(external_id);
CREATE INDEX idx_templates_source_app ON public.templates(source_app);
```

### 9.3 Row Level Security

```sql
-- Public read access
CREATE POLICY "Allow public read" ON public.templates
  FOR SELECT USING (true);

-- API write access (validated by edge function)
CREATE POLICY "Allow API inserts" ON public.templates
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow API updates" ON public.templates
  FOR UPDATE USING (true);
CREATE POLICY "Allow API deletes" ON public.templates
  FOR DELETE USING (true);
```

### 9.4 Auto-Update Trigger

```sql
CREATE OR REPLACE FUNCTION public.update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW
EXECUTE FUNCTION public.update_templates_updated_at();
```

---

## 10. Features Specification

### 10.1 Element Types

#### Basic Elements

| Type | Description | Properties |
|------|-------------|------------|
| `text` | Text block | content, typography styles |
| `image` | Image element | imageUrl, filters, objectFit |
| `table` | Data table | tableData (rows, cols, cells) |
| `shape` | Geometric shape | shapeType (10 variants) |
| `divider` | Horizontal line | strokeStyle, strokeWidth |

#### Layout Elements

| Type | Description | Properties |
|------|-------------|------------|
| `header` | Page header | content, style |
| `footer` | Page footer | content, style |
| `page-number` | Auto page number | format options |
| `watermark` | Background mark | pattern, opacity |
| `date` | Date display | format |

#### Dynamic Elements

| Type | Description | Properties |
|------|-------------|------------|
| `dynamic-field` | API placeholder | dynamicField ({{name}}) |
| `list` | Bullet/numbered | listType, listItems |
| `barcode` | QR/Barcode | barcodeType, barcodeValue |

#### Form Fields

| Type | Description | Properties |
|------|-------------|------------|
| `form-text` | Text input | fieldType, placeholder, validation |
| `form-checkbox` | Checkbox | defaultValue |
| `form-radio` | Radio group | options, groupName |
| `form-dropdown` | Select dropdown | options |
| `form-signature` | Signature field | - |

#### Annotations

| Type | Description | Properties |
|------|-------------|------------|
| `annotation-comment` | Comment marker | author, replies |
| `annotation-note` | Sticky note | content, color |
| `annotation-stamp` | Status stamp | stampType (6 types) |
| `annotation-highlight` | Text highlight | color |

### 10.2 Drawing Tools

| Tool | Description |
|------|-------------|
| `pen` | Freehand drawing |
| `highlighter` | Semi-transparent stroke |
| `eraser` | Remove strokes |
| `arrow` | Arrow annotation |
| `line` | Straight line |

### 10.3 Style Presets

10 default presets:
- Heading 1, 2, 3
- Body Text
- Caption
- Quote
- Primary Button
- Secondary Button
- Card
- Highlight Box

### 10.4 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo |
| `Ctrl/Cmd + S` | Save |
| `Ctrl/Cmd + E` | Export |
| `Ctrl/Cmd + P` | Preview |
| `Ctrl/Cmd + D` | Duplicate |
| `Ctrl/Cmd + Shift + D` | Toggle Drawing |
| `Delete/Backspace` | Delete element |
| `[` / `]` | Reorder layers |
| `1/2/3/4` | Switch panels |
| `?` | Show shortcuts |
| `Escape` | Deselect |
| `Arrow keys` | Move element |
| `Shift + Arrows` | Resize element |

---

## 11. Export Formats

### 11.1 Supported Formats

| Format | Extension | Use Case |
|--------|-----------|----------|
| PDF | `.pdf` | Documents, printing |
| PNG | `.png` | Web, transparency |
| JPG | `.jpg` | Photos, compression |
| SVG | `.svg` | Vector graphics |
| PPTX | `.pptx` | Presentations |

### 11.2 Export Settings

```typescript
interface ExportSettings {
  format: 'pdf' | 'png' | 'jpg' | 'svg' | 'pptx';
  quality?: number;        // 1-100
  compression?: 'none' | 'low' | 'medium' | 'high';
  dpi?: number;            // Resolution
  includeAnnotations?: boolean;
  flattenLayers?: boolean;
}
```

### 11.3 Template Exchange Format

**PDFMaker Format v1.0:**

```typescript
interface PDFMakerTemplate {
  schemaVersion: "1.0";
  type: "pdfmaker-template";
  exportedAt: string;
  template: {
    id: string;
    name: string;
    description?: string;
    metadata: {
      version: string;
      tags?: string[];
      category?: string;
    };
    settings: {
      pageSize: string;
      orientation: string;
      margins: { top, right, bottom, left };
    };
    elements: DocumentElement[];
    dynamicFields: DynamicFieldDefinition[];
  };
}
```

---

## 12. Accessibility

### 12.1 ARIA Implementation

- All interactive elements have `aria-label` attributes
- Role definitions for custom components
- Live regions for dynamic content updates
- Focus management with visible indicators

### 12.2 Keyboard Navigation

- Full keyboard operability
- Tab order follows visual layout
- Arrow key navigation within panels
- Escape key to deselect/close

### 12.3 Screen Reader Support

- `useAnnouncer` hook for status updates
- Descriptive labels for all controls
- State announcements (selected, active)

### 12.4 Visual Accessibility

- High contrast mode support
- Focus visible indicators
- Sufficient color contrast ratios
- Scalable text

---

## 13. Security

### 13.1 API Security

- Sync key validation on all API requests
- Service role key for database access (server-side only)
- CORS headers for cross-origin requests

### 13.2 Document Security

```typescript
interface DocumentPermissions {
  printing?: 'none' | 'low-res' | 'high-res';
  copying?: boolean;
  editing?: boolean;
  annotating?: boolean;
  formFilling?: boolean;
  accessibility?: boolean;
  assembling?: boolean;
}
```

### 13.3 Data Protection

- Row Level Security on database
- Environment variables for sensitive keys
- No client-side exposure of service keys

---

## 14. Dependencies

### 14.1 Production Dependencies

```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.30.1",
  "@tanstack/react-query": "^5.83.0",
  "@supabase/supabase-js": "^2.90.1",
  "tailwindcss": "^3.4.17",
  "@radix-ui/*": "various",
  "lucide-react": "^0.469.0",
  "pptxgenjs": "^4.0.1",
  "docx": "^9.5.1",
  "date-fns": "^3.6.0",
  "uuid": "^11.0.5",
  "zod": "^3.25.0",
  "sonner": "^2.0.3"
}
```

### 14.2 Development Dependencies

```json
{
  "typescript": "~5.6.2",
  "vite": "^5.4.19",
  "@vitejs/plugin-react-swc": "^3.5.0",
  "eslint": "^9.18.0",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.5.2"
}
```

---

## 15. Changelog

### Version 1.0.0 (2026-01-12)

**Initial Baseline Release**

- Documented complete application architecture
- Mapped all 24 element types
- Defined data models and TypeScript interfaces
- Documented API endpoints and webhook system
- Captured database schema and RLS policies
- Specified all user flows
- Listed accessibility features
- Documented security measures
- Created dependency inventory

---

## Document Maintenance

### Update Protocol

When making changes to this specification:

1. **Update affected sections** with accurate information
2. **Add changelog entry** with date and description
3. **Flag impacted dependencies** if architectural changes
4. **Increment version number** as appropriate:
   - Major: Breaking architectural changes
   - Minor: New features or significant updates
   - Patch: Documentation fixes or clarifications

### Traceability

Each section corresponds to specific codebase locations:

| Section | Primary Files |
|---------|---------------|
| Architecture | `src/App.tsx`, `src/pages/Editor.tsx` |
| Data Models | `src/types/editor.ts` |
| Components | `src/components/editor/*` |
| State | `src/hooks/useEditorState.ts` |
| API | `supabase/functions/template-sync/index.ts` |
| Database | `supabase/migrations/*.sql` |
| Services | `src/lib/template*.ts` |

---

*This document serves as the authoritative baseline specification for the DocBuilder application. All future development should reference and update this specification to maintain consistency.*
