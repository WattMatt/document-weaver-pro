import React from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react';
import { DocumentElement } from '@/types/editor';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface LayersPanelProps {
  elements: DocumentElement[];
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<DocumentElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onReorderElement: (id: string, direction: 'up' | 'down') => void;
}

const getElementIcon = (type: string): string => {
  const icons: Record<string, string> = {
    text: 'T',
    header: 'H',
    footer: 'F',
    image: '🖼',
    table: '▦',
    shape: '◼',
    divider: '—',
    list: '☰',
    signature: '✍',
    'dynamic-field': '{ }',
    barcode: '▮▯',
    'page-number': '#',
    watermark: '💧',
    'form-text': '▭',
    'form-checkbox': '☑',
    'form-radio': '◉',
    'form-dropdown': '▼',
    'form-signature': '✍',
    'annotation-comment': '💬',
    'annotation-note': '📝',
    'annotation-stamp': '🔖',
    'annotation-highlight': '🖍',
    drawing: '✏',
  };
  return icons[type] || '●';
};

const getElementLabel = (element: DocumentElement): string => {
  if (element.layerName) return element.layerName;
  
  const typeLabels: Record<string, string> = {
    text: 'Text',
    header: 'Header',
    footer: 'Footer',
    image: 'Image',
    table: 'Table',
    shape: element.shapeType ? element.shapeType.charAt(0).toUpperCase() + element.shapeType.slice(1) : 'Shape',
    divider: 'Divider',
    list: 'List',
    signature: 'Signature',
    'dynamic-field': 'Dynamic Field',
    barcode: 'Barcode',
    'page-number': 'Page Number',
    watermark: 'Watermark',
    'form-text': 'Text Input',
    'form-checkbox': 'Checkbox',
    'form-radio': 'Radio Button',
    'form-dropdown': 'Dropdown',
    'form-signature': 'Signature Field',
    'annotation-comment': 'Comment',
    'annotation-note': 'Note',
    'annotation-stamp': 'Stamp',
    'annotation-highlight': 'Highlight',
    drawing: 'Drawing',
  };
  
  const label = typeLabels[element.type] || element.type;
  const preview = element.content?.slice(0, 20);
  return preview ? `${label}: "${preview}${element.content && element.content.length > 20 ? '...' : ''}"` : label;
};

export const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onReorderElement,
}) => {
  // Reverse elements to show top layers first
  const sortedElements = [...elements].reverse();

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header flex items-center gap-2">
        <Layers className="w-4 h-4 text-primary" />
        <span>Layers</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {elements.length} items
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-0.5">
          {sortedElements.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No elements yet. Add elements from the palette.
            </div>
          ) : (
            sortedElements.map((element, index) => (
              <div
                key={element.id}
                className={cn(
                  "group flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                  "hover:bg-muted/50",
                  selectedElementId === element.id && "bg-primary/10 border border-primary/30",
                  !element.visible && "opacity-50"
                )}
                onClick={() => onSelectElement(element.id)}
              >
                {/* Drag Handle */}
                <GripVertical className="w-3 h-3 text-muted-foreground/50 cursor-grab" />

                {/* Element Icon */}
                <span className="w-5 h-5 flex items-center justify-center text-xs font-medium text-muted-foreground">
                  {getElementIcon(element.type)}
                </span>

                {/* Element Name */}
                <span className="flex-1 text-xs truncate">
                  {getElementLabel(element)}
                </span>

                {/* Quick Actions */}
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(element.id, { visible: element.visible === false ? true : false });
                        }}
                      >
                        {element.visible !== false ? (
                          <Eye className="w-3 h-3" />
                        ) : (
                          <EyeOff className="w-3 h-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {element.visible !== false ? 'Hide' : 'Show'}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateElement(element.id, { locked: !element.locked });
                        }}
                      >
                        {element.locked ? (
                          <Lock className="w-3 h-3" />
                        ) : (
                          <Unlock className="w-3 h-3" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      {element.locked ? 'Unlock' : 'Lock'}
                    </TooltipContent>
                  </Tooltip>
                </div>

                {/* Reorder Buttons */}
                <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderElement(element.id, 'up');
                    }}
                    disabled={index === 0}
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-3 w-4 p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReorderElement(element.id, 'down');
                    }}
                    disabled={index === sortedElements.length - 1}
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Layer Actions */}
      {selectedElementId && (
        <div className="p-2 border-t border-sidebar-border flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 flex-1"
                onClick={() => onDuplicateElement(selectedElementId)}
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                Duplicate
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate selected layer</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-destructive hover:text-destructive"
                onClick={() => onDeleteElement(selectedElementId)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete selected layer</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};
