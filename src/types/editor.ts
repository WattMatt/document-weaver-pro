// === Element Types ===
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

// === Shape Types ===
export type ShapeType = 
  | 'rectangle' 
  | 'circle' 
  | 'line' 
  | 'triangle' 
  | 'diamond' 
  | 'arrow' 
  | 'star' 
  | 'pentagon' 
  | 'hexagon' 
  | 'ellipse';

// === List Types ===
export type ListType = 'none' | 'bullet' | 'numbered';

// === Barcode Types ===
export type BarcodeType = 'qr' | 'code128' | 'code39' | 'ean13' | 'upc';

// === Position & Size ===
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// === Gradient ===
export interface GradientStop {
  offset: number; // 0-100
  color: string;
}

export interface Gradient {
  type: 'linear' | 'radial';
  angle?: number; // For linear gradients (0-360)
  stops: GradientStop[];
}

// === Shadow ===
export interface BoxShadow {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

export interface TextShadow {
  enabled: boolean;
  offsetX: number;
  offsetY: number;
  blur: number;
  color: string;
}

// === Border ===
export interface BorderSide {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  color: string;
}

export interface Border {
  top?: BorderSide;
  right?: BorderSide;
  bottom?: BorderSide;
  left?: BorderSide;
  // Shorthand for all sides
  width?: number;
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  color?: string;
}

export interface BorderRadius {
  topLeft?: number;
  topRight?: number;
  bottomRight?: number;
  bottomLeft?: number;
  // Shorthand for all corners
  all?: number;
}

// === Image Filters ===
export interface ImageFilters {
  brightness: number; // 0-200, default 100
  contrast: number; // 0-200, default 100
  saturation: number; // 0-200, default 100
  blur: number; // 0-20, default 0
  grayscale: number; // 0-100, default 0
  sepia: number; // 0-100, default 0
  hueRotate: number; // 0-360, default 0
}

// === Element Style ===
export interface ElementStyle {
  // Typography
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  color?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  textDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  // Background
  backgroundColor?: string;
  gradient?: Gradient;
  
  // Border
  border?: Border;
  borderColor?: string; // Legacy support
  borderWidth?: number; // Legacy support
  borderRadius?: number | BorderRadius;
  
  // Shadows
  boxShadow?: BoxShadow;
  textShadow?: TextShadow;
  
  // Layout
  padding?: number | { top?: number; right?: number; bottom?: number; left?: number };
  opacity?: number;
  
  // Shape specific
  strokeColor?: string;
  strokeWidth?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  fill?: string;
}

// === Table ===
export interface TableCell {
  content: string;
  style?: ElementStyle;
  colSpan?: number;
  rowSpan?: number;
}

export interface TableData {
  rows: number;
  cols: number;
  cells: TableCell[][];
  headerRow?: boolean;
  alternatingRowColors?: boolean;
  alternatingColor?: string;
  columnWidths?: number[];
  rowHeights?: number[];
}

// === Document Element ===
export interface DocumentElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  style: ElementStyle;
  
  // Content
  content?: string;
  
  // Image specific
  imageUrl?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  imageFilters?: ImageFilters;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  
  // Table specific
  tableData?: TableData;
  
  // Shape specific
  shapeType?: ShapeType;
  
  // List specific
  listType?: ListType;
  listItems?: string[];
  
  // Icon specific
  iconName?: string;
  
  // Barcode specific
  barcodeType?: BarcodeType;
  barcodeValue?: string;
  
  // Dynamic field
  dynamicField?: string;
  
  // Watermark specific
  watermarkOpacity?: number;
  watermarkPattern?: 'single' | 'tiled';
  
  // Transform
  rotation?: number;
  
  // Layer
  zIndex?: number;
  
  // State
  locked?: boolean;
  visible?: boolean;
  
  // Grouping
  groupId?: string;
}

// === Element Group ===
export interface ElementGroup {
  id: string;
  name: string;
  elementIds: string[];
}

// === Template ===
export interface Template {
  id: string;
  name: string;
  description?: string;
  elements: DocumentElement[];
  groups?: ElementGroup[];
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  createdAt: Date;
  updatedAt: Date;
  publicToken?: string;
  integrationTokens?: IntegrationToken[];
  sourceApp?: string;
  sourceTemplateId?: string;
}

// === Integration Token ===
export interface IntegrationToken {
  id: string;
  name: string;
  token: string;
  permissions: ('read' | 'write' | 'generate')[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
}

// === Editor State ===
export interface EditorState {
  currentTemplate: Template | null;
  selectedElementId: string | null;
  selectedElementIds: string[]; // Multi-select support
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
  clipboard?: DocumentElement[];
}

// === Alignment ===
export type AlignmentType = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';
export type DistributionType = 'horizontal' | 'vertical';

// === Default Values ===
export const DEFAULT_IMAGE_FILTERS: ImageFilters = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
};

export const DEFAULT_BOX_SHADOW: BoxShadow = {
  enabled: false,
  offsetX: 0,
  offsetY: 4,
  blur: 8,
  spread: 0,
  color: 'rgba(0, 0, 0, 0.15)',
};

export const DEFAULT_TEXT_SHADOW: TextShadow = {
  enabled: false,
  offsetX: 0,
  offsetY: 2,
  blur: 4,
  color: 'rgba(0, 0, 0, 0.25)',
};

// === Font Families ===
export const FONT_FAMILIES = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: '"Open Sans", sans-serif' },
  { name: 'Lato', value: 'Lato, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Playfair Display', value: '"Playfair Display", serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Source Code Pro', value: '"Source Code Pro", monospace' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
];
