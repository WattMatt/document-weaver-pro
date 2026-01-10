import React from 'react';
import { 
  Type, 
  Image, 
  Table, 
  Square, 
  Minus, 
  FileText, 
  PenTool,
  Braces,
  LayoutTemplate
} from 'lucide-react';
import { ElementType } from '@/types/editor';
import { cn } from '@/lib/utils';

interface ElementsPaletteProps {
  onAddElement: (type: ElementType) => void;
}

interface ElementItem {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const elements: ElementItem[] = [
  { type: 'text', label: 'Text Block', icon: <Type className="w-5 h-5" />, description: 'Add text content' },
  { type: 'header', label: 'Header', icon: <FileText className="w-5 h-5" />, description: 'Section header' },
  { type: 'image', label: 'Image', icon: <Image className="w-5 h-5" />, description: 'Upload or link image' },
  { type: 'table', label: 'Table', icon: <Table className="w-5 h-5" />, description: 'Data table' },
  { type: 'shape', label: 'Shape', icon: <Square className="w-5 h-5" />, description: 'Rectangle, circle, line' },
  { type: 'divider', label: 'Divider', icon: <Minus className="w-5 h-5" />, description: 'Horizontal line' },
  { type: 'signature', label: 'Signature', icon: <PenTool className="w-5 h-5" />, description: 'Signature field' },
  { type: 'dynamic-field', label: 'Dynamic Field', icon: <Braces className="w-5 h-5" />, description: 'API-populated field' },
];

export const ElementsPalette: React.FC<ElementsPaletteProps> = ({ onAddElement }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="panel-header flex items-center gap-2">
        <LayoutTemplate className="w-4 h-4 text-primary" />
        <span>Elements</span>
      </div>
      
      <div className="flex-1 overflow-y-auto scrollbar-thin p-3">
        <div className="grid grid-cols-2 gap-2">
          {elements.map((element) => (
            <button
              key={element.type}
              onClick={() => onAddElement(element.type)}
              className={cn(
                "element-item flex flex-col items-center justify-center gap-2 text-center",
                "min-h-[80px]"
              )}
            >
              <div className="text-muted-foreground group-hover:text-primary transition-colors">
                {element.icon}
              </div>
              <div>
                <div className="text-xs font-medium text-foreground">{element.label}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{element.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
