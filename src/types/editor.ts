export type ElementType =
  | 'text'
  | 'image'
  | 'table'
  | 'shape'
  | 'divider'
  | 'header'
  | 'footer'
  | 'signature'
  | 'dynamic-field'
  | 'list'
  | 'icon'
  | 'barcode'
  | 'page-number'
  | 'watermark'
  | 'date'
  // Form fields
  | 'form-text'
  | 'form-checkbox'
  | 'form-radio'
  | 'form-dropdown'
  | 'form-signature'
  // Annotations
  | 'annotation-comment'
  | 'annotation-note'
  | 'annotation-stamp'
  | 'annotation-highlight'
  // Drawing
  | 'drawing';

export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'ellipse'
  | 'triangle'
  | 'diamond'
  | 'pentagon'
  | 'hexagon'
  | 'star'
  | 'arrow'
  | 'line';

export type ListType = 'bullet' | 'numbered' | 'none';
export type BarcodeType = 'qr' | 'code128' | 'code39' | 'ean13' | 'upc';

// Form field types
export type FormFieldType = 'text' | 'multiline' | 'email' | 'number' | 'date' | 'phone';
export type StampType = 'approved' | 'rejected' | 'draft' | 'confidential' | 'final' | 'custom';

// Drawing tool types
export type DrawingTool = 'pen' | 'highlighter' | 'eraser' | 'arrow' | 'line';

export interface DrawingPath {
  id: string;
  tool: DrawingTool;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  opacity: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GradientStop {
  offset: number;
  color: string;
}

export interface Gradient {
  type: 'linear' | 'radial';
  angle?: number;
  stops: GradientStop[];
}

export interface BoxShadow {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

export interface BorderStyle {
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  width: number;
  color: string;
}

export interface ImageFilters {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
}

// Form field properties
export interface FormFieldProperties {
  fieldType?: FormFieldType;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  options?: string[]; // For dropdowns and radio buttons
  defaultValue?: string;
  readOnly?: boolean;
  groupName?: string; // For radio button groups
}

// Annotation properties
export interface AnnotationProperties {
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  replies?: AnnotationReply[];
  status?: 'open' | 'resolved' | 'cancelled';
  stampType?: StampType;
  customStampText?: string;
}

export interface AnnotationReply {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export interface ElementStyle {
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;
  backgroundColor?: string;
  gradient?: Gradient;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  border?: Partial<BorderStyle>;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  strokeWidth?: number;
  strokeColor?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  letterSpacing?: number;
  wordSpacing?: number;
  lineHeight?: number;
  textIndent?: number;
  columnCount?: number;
  columnGap?: number;
  padding?: number;
  margin?: number;
  opacity?: number;
  boxShadow?: BoxShadow;
  linkUrl?: string;
}

export interface TableCell {
  content: string;
  style?: ElementStyle;
}

export interface TableData {
  rows: number;
  cols: number;
  cells: TableCell[][];
  headerRow?: boolean;
  alternatingRowColors?: boolean;
  alternatingColor?: string;
}

export interface DocumentElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
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
  shapeFilled?: boolean; // true = filled shape, false = stroke-only outline
  listType?: ListType;
  listItems?: string[];
  barcodeType?: BarcodeType;
  barcodeValue?: string;
  dynamicField?: string;
  watermarkPattern?: 'single' | 'tiled';
  watermarkOpacity?: number;
  locked?: boolean;
  visible?: boolean;
  // Form field properties
  formField?: FormFieldProperties;
  // Annotation properties
  annotation?: AnnotationProperties;
  // Drawing paths
  drawingPaths?: DrawingPath[];
  // Layer grouping
  layerName?: string;
  groupId?: string;
}

// Page for multi-page documents
export interface Page {
  id: string;
  name: string;
  elements: DocumentElement[];
  backgroundColor?: string;
  rotation?: 0 | 90 | 180 | 270;
}

// Document properties for metadata
export interface DocumentProperties {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  // Security
  password?: string;
  permissions?: DocumentPermissions;
}

export interface DocumentPermissions {
  printing?: 'none' | 'low-res' | 'high-res';
  copying?: boolean;
  editing?: boolean;
  annotating?: boolean;
  formFilling?: boolean;
  accessibility?: boolean;
  assembling?: boolean;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  elements: DocumentElement[];
  pages?: Page[]; // Multi-page support
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
  // Export settings
  exportSettings?: ExportSettings;
}

export interface ExportSettings {
  format: 'pdf' | 'png' | 'jpg' | 'svg' | 'pptx';
  quality?: number; // 1-100 for images
  compression?: 'none' | 'low' | 'medium' | 'high';
  dpi?: number;
  includeAnnotations?: boolean;
  flattenLayers?: boolean;
}

export interface SlideProperties {
  backgroundColor?: string;
  transition?: 'none' | 'fade' | 'slide' | 'zoom';
}

// Style presets
export interface StylePreset {
  id: string;
  name: string;
  category: 'text' | 'heading' | 'button' | 'shape' | 'custom';
  style: Partial<ElementStyle>;
  preview?: string;
}

// History entry for undo/redo
export interface HistoryEntry {
  id: string;
  timestamp: Date;
  action: string;
  snapshot: EditorState;
}

export interface EditorState {
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
  // Drawing mode
  isDrawingMode?: boolean;
  currentDrawingTool?: DrawingTool;
  drawingColor?: string;
  drawingWidth?: number;
  // Current page for multi-page
  currentPageId?: string;
  // Active panel
  activePanel?: 'elements' | 'layers' | 'styles' | 'pages';
}

// PDFMaker types for import/export
export interface TemplateMetadata {
  version: string;
  tags?: string[];
  category?: string;
}

export interface TemplateSettings {
  pageSize: 'A4' | 'Letter' | 'Legal' | 'Custom';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface DynamicFieldDefinition {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  required: boolean;
  defaultValue: string | number | boolean;
  description?: string;
}

export interface PDFMakerTemplate {
  schemaVersion: string;
  type: 'pdfmaker-template';
  exportedAt: string;
  template: {
    id: string;
    name: string;
    description?: string;
    metadata: TemplateMetadata;
    settings: TemplateSettings;
    elements: DocumentElement[];
    dynamicFields: DynamicFieldDefinition[];
  };
}

export interface TemplateImportResult {
  success: boolean;
  template?: Template;
  errors?: string[];
  warnings?: string[];
}

export interface TemplateExportOptions {
  includeMetadata?: boolean;
  includeDynamicFields?: boolean;
  schemaVersion?: string;
}

export interface TemplateManifest {
  schemaVersion: string;
  type: 'pdfmaker-manifest';
  exportedAt: string;
  count: number;
  templates: {
    id: string;
    name: string;
    description?: string;
    metadata: TemplateMetadata;
  }[];
}

export const FONT_FAMILIES = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Monospace', value: 'monospace' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Source Code Pro', value: '"Source Code Pro", monospace' },
];

export const DEFAULT_BOX_SHADOW: BoxShadow = {
  enabled: false,
  offsetX: 0,
  offsetY: 4,
  blur: 8,
  spread: 0,
  color: 'rgba(0,0,0,0.15)',
};

// Default style presets
export const DEFAULT_STYLE_PRESETS: StylePreset[] = [
  {
    id: 'heading-1',
    name: 'Heading 1',
    category: 'heading',
    style: { fontSize: 32, fontWeight: 'bold', color: '#1a1a1a' },
  },
  {
    id: 'heading-2',
    name: 'Heading 2',
    category: 'heading',
    style: { fontSize: 24, fontWeight: '600', color: '#1a1a1a' },
  },
  {
    id: 'heading-3',
    name: 'Heading 3',
    category: 'heading',
    style: { fontSize: 18, fontWeight: '600', color: '#374151' },
  },
  {
    id: 'body-text',
    name: 'Body Text',
    category: 'text',
    style: { fontSize: 14, fontWeight: 'normal', color: '#374151', lineHeight: 1.6 },
  },
  {
    id: 'caption',
    name: 'Caption',
    category: 'text',
    style: { fontSize: 12, fontWeight: 'normal', color: '#6b7280' },
  },
  {
    id: 'quote',
    name: 'Quote',
    category: 'text',
    style: { fontSize: 16, fontStyle: 'italic', color: '#4b5563', borderColor: '#3b82f6', padding: 16 },
  },
  {
    id: 'primary-button',
    name: 'Primary Button',
    category: 'button',
    style: { backgroundColor: '#3b82f6', color: '#ffffff', padding: 12, borderRadius: 8 },
  },
  {
    id: 'secondary-button',
    name: 'Secondary Button',
    category: 'button',
    style: { backgroundColor: '#f3f4f6', color: '#374151', padding: 12, borderRadius: 8 },
  },
  {
    id: 'card',
    name: 'Card',
    category: 'shape',
    style: { backgroundColor: '#ffffff', borderRadius: 12, boxShadow: { enabled: true, offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: 'rgba(0,0,0,0.1)' } },
  },
  {
    id: 'highlight-box',
    name: 'Highlight Box',
    category: 'shape',
    style: { backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: 1, padding: 16, borderRadius: 8 },
  },
];

export const STAMP_PRESETS: { type: StampType; label: string; color: string }[] = [
  { type: 'approved', label: 'APPROVED', color: '#22c55e' },
  { type: 'rejected', label: 'REJECTED', color: '#ef4444' },
  { type: 'draft', label: 'DRAFT', color: '#6b7280' },
  { type: 'confidential', label: 'CONFIDENTIAL', color: '#ef4444' },
  { type: 'final', label: 'FINAL', color: '#3b82f6' },
];
