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
  // Form fields
  TextCursorInput,
  CheckSquare,
  CircleDot,
  ChevronDown,
  // Annotations
  MessageSquare,
  StickyNote,
  Stamp,
  Highlighter,
  // Shapes
  Circle,
  Triangle,
  Star,
  Hexagon,
  ArrowRight,
  Diamond,
} from 'lucide-react';
import { ElementType, ShapeType } from '@/types/editor';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ElementsPaletteProps {
  onAddElement: (type: ElementType, shapeType?: ShapeType) => void;
}

interface ElementItem {
  type: ElementType;
  label: string;
  icon: React.ReactNode;
  description: string;
  shapeType?: ShapeType;
}

interface ElementCategory {
  name: string;
  items: ElementItem[];
  defaultOpen?: boolean;
}

const elementCategories: ElementCategory[] = [
  {
    name: 'Text',
    defaultOpen: true,
    items: [
      { type: 'text', label: 'Text Block', icon: <Type className="w-5 h-5" />, description: 'Add text content' },
      { type: 'header', label: 'Header', icon: <FileText className="w-5 h-5" />, description: 'Section header' },
      { type: 'list', label: 'List', icon: <List className="w-5 h-5" />, description: 'Bullet or numbered' },
    ],
  },
  {
    name: 'Media',
    defaultOpen: true,
    items: [
      { type: 'image', label: 'Image', icon: <Image className="w-5 h-5" />, description: 'Upload or link' },
      { type: 'icon', label: 'Icon', icon: <Smile className="w-5 h-5" />, description: 'Icon library' },
    ],
  },
  {
    name: 'Shapes',
    defaultOpen: true,
    items: [
      { type: 'shape', label: 'Rectangle', icon: <Square className="w-5 h-5" />, description: 'Rectangle', shapeType: 'rectangle' },
      { type: 'shape', label: 'Circle', icon: <Circle className="w-5 h-5" />, description: 'Circle', shapeType: 'circle' },
      { type: 'shape', label: 'Triangle', icon: <Triangle className="w-5 h-5" />, description: 'Triangle', shapeType: 'triangle' },
      { type: 'shape', label: 'Star', icon: <Star className="w-5 h-5" />, description: 'Star', shapeType: 'star' },
      { type: 'shape', label: 'Diamond', icon: <Diamond className="w-5 h-5" />, description: 'Diamond', shapeType: 'diamond' },
      { type: 'shape', label: 'Hexagon', icon: <Hexagon className="w-5 h-5" />, description: 'Hexagon', shapeType: 'hexagon' },
      { type: 'shape', label: 'Arrow', icon: <ArrowRight className="w-5 h-5" />, description: 'Arrow', shapeType: 'arrow' },
      { type: 'shape', label: 'Line', icon: <Minus className="w-5 h-5" />, description: 'Line', shapeType: 'line' },
      { type: 'divider', label: 'Divider', icon: <Minus className="w-5 h-5" />, description: 'Horizontal line' },
    ],
  },
  {
    name: 'Form Fields',
    defaultOpen: false,
    items: [
      { type: 'form-text', label: 'Text Input', icon: <TextCursorInput className="w-5 h-5" />, description: 'Single/multi line' },
      { type: 'form-checkbox', label: 'Checkbox', icon: <CheckSquare className="w-5 h-5" />, description: 'Check options' },
      { type: 'form-radio', label: 'Radio Button', icon: <CircleDot className="w-5 h-5" />, description: 'Single choice' },
      { type: 'form-dropdown', label: 'Dropdown', icon: <ChevronDown className="w-5 h-5" />, description: 'Select menu' },
      { type: 'form-signature', label: 'Signature', icon: <PenTool className="w-5 h-5" />, description: 'Signature field' },
    ],
  },
  {
    name: 'Annotations',
    defaultOpen: false,
    items: [
      { type: 'annotation-comment', label: 'Comment', icon: <MessageSquare className="w-5 h-5" />, description: 'Add comment' },
      { type: 'annotation-note', label: 'Sticky Note', icon: <StickyNote className="w-5 h-5" />, description: 'Yellow note' },
      { type: 'annotation-stamp', label: 'Stamp', icon: <Stamp className="w-5 h-5" />, description: 'Approved/Draft' },
      { type: 'annotation-highlight', label: 'Highlight', icon: <Highlighter className="w-5 h-5" />, description: 'Highlight area' },
    ],
  },
  {
    name: 'Data',
    defaultOpen: false,
    items: [
      { type: 'table', label: 'Table', icon: <Table className="w-5 h-5" />, description: 'Data table' },
      { type: 'dynamic-field', label: 'Dynamic Field', icon: <Braces className="w-5 h-5" />, description: 'API-populated' },
      { type: 'barcode', label: 'Barcode/QR', icon: <QrCode className="w-5 h-5" />, description: 'QR or barcode' },
    ],
  },
  {
    name: 'Special',
    defaultOpen: false,
    items: [
      { type: 'signature', label: 'Signature', icon: <PenTool className="w-5 h-5" />, description: 'Signature field' },
      { type: 'footer', label: 'Footer', icon: <FileText className="w-5 h-5" />, description: 'Page footer' },
      { type: 'page-number', label: 'Page Number', icon: <Hash className="w-5 h-5" />, description: 'Auto numbering' },
      { type: 'watermark', label: 'Watermark', icon: <Droplets className="w-5 h-5" />, description: 'Background text' },
    ],
  },
];

export const ElementsPalette: React.FC<ElementsPaletteProps> = ({ onAddElement }) => {
  const [openCategories, setOpenCategories] = useState<string[]>(
    elementCategories.filter(c => c.defaultOpen).map(c => c.name)
  );

  const toggleCategory = (name: string) => {
    setOpenCategories(prev =>
      prev.includes(name)
        ? prev.filter(n => n !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header flex items-center gap-2">
        <LayoutTemplate className="w-4 h-4 text-primary" />
        <span>Elements</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {elementCategories.map((category) => (
            <Collapsible
              key={category.name}
              open={openCategories.includes(category.name)}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <CollapsibleTrigger className="flex items-center w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors rounded hover:bg-muted/50">
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 mr-1 transition-transform",
                    openCategories.includes(category.name) && "rotate-90"
                  )}
                />
                {category.name}
                <span className="ml-auto text-[10px] font-normal">
                  {category.items.length}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="grid grid-cols-2 gap-1.5 p-1.5">
                  {category.items.map((element, idx) => (
                    <Tooltip key={`${element.type}-${idx}`}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onAddElement(element.type)}
                          className={cn(
                            "element-item flex flex-col items-center justify-center gap-1 text-center",
                            "min-h-[60px] p-2 rounded-md border border-transparent",
                            "hover:border-primary/30 hover:bg-primary/5 transition-all",
                            "active:scale-95"
                          )}
                        >
                          <div className="text-muted-foreground">
                            {element.icon}
                          </div>
                          <div className="text-[10px] font-medium text-foreground truncate w-full">
                            {element.label}
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
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
