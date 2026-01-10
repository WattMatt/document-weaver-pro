import React from 'react';
import { Settings, Trash2, Copy, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { DocumentElement } from '@/types/editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

interface PropertiesPanelProps {
  element: DocumentElement | null;
  onUpdateElement: (id: string, updates: Partial<DocumentElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  element,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
}) => {
  if (!element) {
    return (
      <div className="h-full flex flex-col">
        <div className="panel-header flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span>Properties</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-muted-foreground text-center">
            Select an element to view its properties
          </p>
        </div>
      </div>
    );
  }

  const updateStyle = (key: string, value: any) => {
    onUpdateElement(element.id, {
      style: { ...element.style, [key]: value },
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span>Properties</span>
        </div>
        <span className="text-xs text-muted-foreground capitalize">{element.type}</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-6">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDuplicateElement(element.id)}
            className="flex-1"
          >
            <Copy className="w-3.5 h-3.5 mr-1.5" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateElement(element.id, { locked: !element.locked })}
          >
            {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onUpdateElement(element.id, { visible: !element.visible })}
          >
            {element.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteElement(element.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <Separator />

        {/* Position */}
        <div className="space-y-3">
          <Label className="input-label">Position</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">X</Label>
              <Input
                type="number"
                value={Math.round(element.position.x)}
                onChange={(e) => onUpdateElement(element.id, {
                  position: { ...element.position, x: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Y</Label>
              <Input
                type="number"
                value={Math.round(element.position.y)}
                onChange={(e) => onUpdateElement(element.id, {
                  position: { ...element.position, y: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
          </div>
        </div>

        {/* Size */}
        <div className="space-y-3">
          <Label className="input-label">Size</Label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Width</Label>
              <Input
                type="number"
                value={Math.round(element.size.width)}
                onChange={(e) => onUpdateElement(element.id, {
                  size: { ...element.size, width: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Height</Label>
              <Input
                type="number"
                value={Math.round(element.size.height)}
                onChange={(e) => onUpdateElement(element.id, {
                  size: { ...element.size, height: Number(e.target.value) }
                })}
                className="h-8"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Typography (for text elements) */}
        {(element.type === 'text' || element.type === 'header' || element.type === 'footer') && (
          <div className="space-y-3">
            <Label className="input-label">Typography</Label>
            
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Font Size</Label>
              <div className="flex items-center gap-3">
                <Slider
                  value={[element.style.fontSize || 14]}
                  onValueChange={([value]) => updateStyle('fontSize', value)}
                  min={8}
                  max={72}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-8">{element.style.fontSize}px</span>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Font Weight</Label>
              <Select
                value={element.style.fontWeight || 'normal'}
                onValueChange={(value) => updateStyle('fontWeight', value)}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="semibold">Semibold</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Text Align</Label>
              <Select
                value={element.style.textAlign || 'left'}
                onValueChange={(value) => updateStyle('textAlign', value as 'left' | 'center' | 'right')}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Colors */}
        <div className="space-y-3">
          <Label className="input-label">Colors</Label>
          
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Text Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={element.style.color || '#1a1a1a'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <Input
                value={element.style.color || '#1a1a1a'}
                onChange={(e) => updateStyle('color', e.target.value)}
                className="h-8 flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={element.style.backgroundColor || '#ffffff'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <Input
                value={element.style.backgroundColor || 'transparent'}
                onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                className="h-8 flex-1"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {(element.type === 'text' || element.type === 'header' || element.type === 'footer' || element.type === 'dynamic-field') && (
          <>
            <Separator />
            <div className="space-y-3">
              <Label className="input-label">Content</Label>
              <textarea
                value={element.content || ''}
                onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
                className="w-full h-24 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter content..."
              />
            </div>
          </>
        )}

        {/* Dynamic Field */}
        {element.type === 'dynamic-field' && (
          <div className="space-y-3">
            <Label className="input-label">Field Name</Label>
            <Input
              value={element.dynamicField || ''}
              onChange={(e) => onUpdateElement(element.id, { dynamicField: e.target.value })}
              placeholder="e.g., customer_name"
              className="h-8"
            />
            <p className="text-xs text-muted-foreground">
              This field will be populated via API using the field name
            </p>
          </div>
        )}

        {/* Shape Type */}
        {element.type === 'shape' && (
          <div className="space-y-3">
            <Label className="input-label">Shape Type</Label>
            <Select
              value={element.shapeType || 'rectangle'}
              onValueChange={(value) => onUpdateElement(element.id, { 
                shapeType: value as 'rectangle' | 'circle' | 'line' 
              })}
            >
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rectangle">Rectangle</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
                <SelectItem value="line">Line</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
};
