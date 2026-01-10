export type ElementType = 'text' | 'image' | 'table' | 'shape' | 'divider' | 'header' | 'footer' | 'signature' | 'dynamic-field';

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ElementStyle {
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  textAlign?: 'left' | 'center' | 'right';
  padding?: number;
  opacity?: number;
}

export interface TableCell {
  content: string;
  style?: ElementStyle;
}

export interface TableData {
  rows: number;
  cols: number;
  cells: TableCell[][];
}

export interface DocumentElement {
  id: string;
  type: ElementType;
  position: Position;
  size: Size;
  style: ElementStyle;
  content?: string;
  imageUrl?: string;
  tableData?: TableData;
  shapeType?: 'rectangle' | 'circle' | 'line';
  dynamicField?: string;
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
  publicToken?: string;
  integrationTokens?: IntegrationToken[];
}

export interface IntegrationToken {
  id: string;
  name: string;
  token: string;
  permissions: ('read' | 'write' | 'generate')[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsed?: Date;
}

export interface EditorState {
  currentTemplate: Template | null;
  selectedElementId: string | null;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;
}
