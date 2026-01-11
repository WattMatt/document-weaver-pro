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
  LayoutTemplate,
  List,
  Smile,
  QrCode,
  Hash,
  Droplets,
} from 'lucide-react';
import { ElementType } from '@/types/editor';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ElementsPaletteProps {
  onAddElement: (type: ElementType) => void;
}

interface ElementItem {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface ElementCategory {
  name: string;
  items: ElementItem[];
}

const elementCategories: ElementCategory[] = [
  {
    name: 'Text',
    items: [
      { type: 'text', label: 'Text Block', icon: <Type className="w-5 h-5" />, description: 'Add text content' },
      { type: 'header', label: 'Header', icon: <FileText className="w-5 h-5" />, description: 'Section header' },
      { type: 'list', label: 'List', icon: <List className="w-5 h-5" />, description: 'Bullet or numbered' },
    ],
  },
  {
    name: 'Media',
    items: [
      { type: 'image', label: 'Image', icon: <Image className="w-5 h-5" />, description: 'Upload or link' },
      { type: 'icon', label: 'Icon', icon: <Smile className="w-5 h-5" />, description: 'Icon library' },
    ],
  },
  {
    name: 'Data',
    items: [
      { type: 'table', label: 'Table', icon: <Table className="w-5 h-5" />, description: 'Data table' },
      { type: 'dynamic-field', label: 'Dynamic Field', icon: <Braces className="w-5 h-5" />, description: 'API-populated' },
      { type: 'barcode', label: 'Barcode/QR', icon: <QrCode className="w-5 h-5" />, description: 'QR or barcode' },
    ],
  },
  {
    name: 'Shapes',
    items: [
      { type: 'shape', label: 'Rectangle', icon: <Square className="w-5 h-5" />, description: 'Basic shape' },
      { type: 'divider', label: 'Divider', icon: <Minus className="w-5 h-5" />, description: 'Horizontal line' },
    ],
  },
  {
    name: 'Special',
    items: [
      { type: 'signature', label: 'Signature', icon: <PenTool className="w-5 h-5" />, description: 'Signature field' },
      { type: 'footer', label: 'Footer', icon: <FileText className="w-5 h-5" />, description: 'Page footer' },
      { type: 'page-number', label: 'Page Number', icon: <Hash className="w-5 h-5" />, description: 'Auto numbering' },
      { type: 'watermark', label: 'Watermark', icon: <Droplets className="w-5 h-5" />, description: 'Background text' },
    ],
  },
];

export const ElementsPalette: React.FC<ElementsPaletteProps> = ({ onAddElement }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="panel-header flex items-center gap-2">
        <LayoutTemplate className="w-4 h-4 text-primary" />
        <span>Elements</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {elementCategories.map((category, catIndex) => (
            <div key={category.name}>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
                {category.name}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((element) => (
                  <Tooltip key={element.type}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onAddElement(element.type)}
                        className={cn(
                          "element-item flex flex-col items-center justify-center gap-1.5 text-center",
                          "min-h-[72px] p-2 rounded-lg border border-transparent",
                          "hover:border-primary/30 hover:bg-primary/5 transition-all"
                        )}
                      >
                        <div className="text-muted-foreground group-hover:text-primary transition-colors">
                          {element.icon}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-foreground">{element.label}</div>
                          <div className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{element.description}</div>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="font-medium">{element.label}</p>
                      <p className="text-xs text-muted-foreground">{element.description}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              {catIndex < elementCategories.length - 1 && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
