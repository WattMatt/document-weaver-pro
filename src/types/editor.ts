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
  | 'watermark';

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
  listType?: ListType;
  listItems?: string[];
  barcodeType?: BarcodeType;
  barcodeValue?: string;
  dynamicField?: string;
  watermarkPattern?: 'single' | 'tiled';
  watermarkOpacity?: number;
  locked?: boolean;
  visible?: boolean;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  elements: DocumentElement[];
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  createdAt: Date;
  updatedAt: Date;
  sourceApp?: string;
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
}

// PDFMaker types for import/export
export interface TemplateMetadata {
  version: string;
  tags?: string[];
  category?: string;
}

export interface TemplateSettings {
  pageSize: 'A4' | 'Letter' | 'Legal';
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
  { name: 'Monospace', value: 'monospace' },
  { name: 'Courier New', value: '"Courier New", monospace' },
];

export const DEFAULT_BOX_SHADOW: BoxShadow = {
  enabled: false,
  offsetX: 0,
  offsetY: 4,
  blur: 8,
  spread: 0,
  color: 'rgba(0,0,0,0.15)',
};
