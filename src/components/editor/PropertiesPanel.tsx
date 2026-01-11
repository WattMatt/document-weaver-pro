import React, { useState } from 'react';
import {
  Settings,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  RotateCw,
  FlipHorizontal2,
  FlipVertical2,
  ArrowUpToLine,
  ArrowDownToLine,
  MoveUp,
  MoveDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Plus,
  Minus,
  Hash,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';
import {
  DocumentElement,
  ElementStyle,
  FONT_FAMILIES,
  DEFAULT_BOX_SHADOW,
  ShapeType,
  ListType,
  BarcodeType
} from '@/types/editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { GradientPicker } from './GradientPicker';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface PropertiesPanelProps {
  element: DocumentElement | null;
  onUpdateElement: (id: string, updates: Partial<DocumentElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onBringToFront?: (id: string) => void;
  onSendToBack?: (id: string) => void;
  onBringForward?: (id: string) => void;
  onSendBackward?: (id: string) => void;
  onRotateElement?: (id: string, degrees: number) => void;
  onFlipElement?: (id: string, axis: 'horizontal' | 'vertical') => void;
}

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, defaultOpen = true, children }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium hover:text-primary transition-colors">
        <span>{title}</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  element,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringToFront,
  onSendToBack,
  onBringForward,
  onSendBackward,
  onRotateElement,
  onFlipElement,
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

  const updateStyle = (key: keyof ElementStyle, value: any) => {
    onUpdateElement(element.id, {
      style: { ...element.style, [key]: value },
    });
  };

  const isTextElement = ['text', 'header', 'footer', 'dynamic-field', 'list', 'page-number', 'watermark'].includes(element.type);
  const isImageElement = element.type === 'image';
  const isShapeElement = element.type === 'shape';
  const isTableElement = element.type === 'table';
  const isListElement = element.type === 'list';
  const isBarcodeElement = element.type === 'barcode';

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span>Properties</span>
        </div>
        <span className="text-xs text-muted-foreground capitalize bg-muted px-2 py-0.5 rounded">
          {element.type}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {/* Quick Actions */}
          <div className="flex items-center gap-1.5 flex-wrap pb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicateElement(element.id)}
              className="h-8 px-2"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateElement(element.id, { locked: !element.locked })}
              className="h-8 px-2"
              title={element.locked ? "Unlock" : "Lock"}
            >
              {element.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdateElement(element.id, { visible: !element.visible })}
              className="h-8 px-2"
              title={element.visible !== false ? "Hide" : "Show"}
            >
              {element.visible !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </Button>
            <div className="flex-1" />
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDeleteElement(element.id)}
              className="h-8 px-2"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>

          <Separator />

          {/* Layout Section */}
          <Section title="Layout">
            {/* Position */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Position</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground w-3">X</span>
                  <Input
                    type="number"
                    value={Math.round(element.position.x)}
                    onChange={(e) => onUpdateElement(element.id, {
                      position: { ...element.position, x: Number(e.target.value) }
                    })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground w-3">Y</span>
                  <Input
                    type="number"
                    value={Math.round(element.position.y)}
                    onChange={(e) => onUpdateElement(element.id, {
                      position: { ...element.position, y: Number(e.target.value) }
                    })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Size */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Size</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground w-3">W</span>
                  <Input
                    type="number"
                    value={Math.round(element.size.width)}
                    onChange={(e) => onUpdateElement(element.id, {
                      size: { ...element.size, width: Number(e.target.value) }
                    })}
                    className="h-7 text-xs"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground w-3">H</span>
                  <Input
                    type="number"
                    value={Math.round(element.size.height)}
                    onChange={(e) => onUpdateElement(element.id, {
                      size: { ...element.size, height: Number(e.target.value) }
                    })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Rotation</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[element.rotation || 0]}
                  onValueChange={([value]) => onUpdateElement(element.id, { rotation: value })}
                  min={0}
                  max={360}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">{element.rotation || 0}°</span>
              </div>
            </div>

            {/* Layer Controls */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Layer</Label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 flex-1"
                  onClick={() => onBringToFront?.(element.id)}
                  title="Bring to Front"
                >
                  <ArrowUpToLine className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 flex-1"
                  onClick={() => onBringForward?.(element.id)}
                  title="Bring Forward"
                >
                  <MoveUp className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 flex-1"
                  onClick={() => onSendBackward?.(element.id)}
                  title="Send Backward"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2 flex-1"
                  onClick={() => onSendToBack?.(element.id)}
                  title="Send to Back"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Opacity</Label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[(element.style.opacity ?? 1) * 100]}
                  onValueChange={([value]) => updateStyle('opacity', value / 100)}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {Math.round((element.style.opacity ?? 1) * 100)}%
                </span>
              </div>
            </div>
          </Section>

          <Separator />

          {/* Typography Section (for text elements) */}
          {isTextElement && (
            <>
              <Section title="Typography">
                {/* Font Family */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Font Family</Label>
                  <Select
                    value={element.style.fontFamily || 'Inter, sans-serif'}
                    onValueChange={(value) => updateStyle('fontFamily', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Font Size & Weight */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Size</Label>
                    <Input
                      type="number"
                      value={element.style.fontSize || 14}
                      onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                      min={8}
                      max={120}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Weight</Label>
                    <Select
                      value={element.style.fontWeight || 'normal'}
                      onValueChange={(value) => updateStyle('fontWeight', value)}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">Thin</SelectItem>
                        <SelectItem value="200">Extra Light</SelectItem>
                        <SelectItem value="300">Light</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semibold</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="800">Extra Bold</SelectItem>
                        <SelectItem value="900">Black</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Font Style Toggles */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Style</Label>
                  <div className="flex items-center gap-1">
                    <Button
                      variant={element.style.fontStyle === 'italic' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => updateStyle('fontStyle', element.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant={element.style.textDecoration === 'underline' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => updateStyle('textDecoration', element.style.textDecoration === 'underline' ? 'none' : 'underline')}
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant={element.style.textDecoration === 'line-through' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => updateStyle('textDecoration', element.style.textDecoration === 'line-through' ? 'none' : 'line-through')}
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Text Alignment */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Alignment</Label>
                  <ToggleGroup
                    type="single"
                    value={element.style.textAlign || 'left'}
                    onValueChange={(value) => value && updateStyle('textAlign', value)}
                    className="justify-start"
                  >
                    <ToggleGroupItem value="left" className="h-7 w-7 p-0">
                      <AlignLeft className="w-3.5 h-3.5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="center" className="h-7 w-7 p-0">
                      <AlignCenter className="w-3.5 h-3.5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="right" className="h-7 w-7 p-0">
                      <AlignRight className="w-3.5 h-3.5" />
                    </ToggleGroupItem>
                    <ToggleGroupItem value="justify" className="h-7 w-7 p-0">
                      <AlignJustify className="w-3.5 h-3.5" />
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                {/* Text Transform */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Transform</Label>
                  <Select
                    value={element.style.textTransform || 'none'}
                    onValueChange={(value) => updateStyle('textTransform', value)}
                  >
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="uppercase">UPPERCASE</SelectItem>
                      <SelectItem value="lowercase">lowercase</SelectItem>
                      <SelectItem value="capitalize">Capitalize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Line Height & Letter Spacing */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Line Height</Label>
                    <Input
                      type="number"
                      value={element.style.lineHeight || 1.5}
                      onChange={(e) => updateStyle('lineHeight', Number(e.target.value))}
                      min={0.5}
                      max={3}
                      step={0.1}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Letter Spacing</Label>
                    <Input
                      type="number"
                      value={element.style.letterSpacing || 0}
                      onChange={(e) => updateStyle('letterSpacing', Number(e.target.value))}
                      min={-5}
                      max={20}
                      step={0.5}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </Section>
              <Separator />
            </>
          )}

          {/* Background Color Section for non-text elements */}
          {!element.style.gradient && !isTextElement && (
            <Section title="Background">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Solid Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={element.style.backgroundColor === 'transparent' ? '#ffffff' : (element.style.backgroundColor || '#ffffff')}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="w-8 h-7 rounded border cursor-pointer"
                  />
                  <Input
                    value={element.style.backgroundColor || 'transparent'}
                    onChange={(e) => updateStyle('backgroundColor', e.target.value)}
                    className="h-7 flex-1 text-xs font-mono"
                    placeholder="transparent"
                  />
                </div>
              </div>
            </Section>
          )}

        <Separator />

        {/* Typography Section (Enhanced) */}
        {isTextElement && (
          <Section title="Typography & Layout">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-8 mb-2">
                <TabsTrigger value="text" className="text-xs">Text</TabsTrigger>
                <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
                <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="space-y-3">
                {/* Font Family */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Font</Label>
                  <Select
                    value={element.style.fontFamily || 'Inter, sans-serif'}
                    onValueChange={(value) => updateStyle('fontFamily', value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_FAMILIES.map((font) => (
                        <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Size & Weight */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Size</Label>
                    <Input
                      type="number"
                      value={element.style.fontSize || 14}
                      onChange={(e) => updateStyle('fontSize', Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Weight</Label>
                    <Select
                      value={element.style.fontWeight || 'normal'}
                      onValueChange={(value) => updateStyle('fontWeight', value)}
                    >
                      <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="100">Thin</SelectItem>
                        <SelectItem value="300">Light</SelectItem>
                        <SelectItem value="900">Black</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Align</Label>
                  <ToggleGroup
                    type="single"
                    value={element.style.textAlign || 'left'}
                    onValueChange={(value) => value && updateStyle('textAlign', value)}
                    className="justify-start border rounded-md p-0.5"
                  >
                    <ToggleGroupItem value="left" className="h-6 w-7 p-0"><AlignLeft className="w-3.5 h-3.5" /></ToggleGroupItem>
                    <ToggleGroupItem value="center" className="h-6 w-7 p-0"><AlignCenter className="w-3.5 h-3.5" /></ToggleGroupItem>
                    <ToggleGroupItem value="right" className="h-6 w-7 p-0"><AlignRight className="w-3.5 h-3.5" /></ToggleGroupItem>
                    <ToggleGroupItem value="justify" className="h-6 w-7 p-0"><AlignJustify className="w-3.5 h-3.5" /></ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </TabsContent>

              <TabsContent value="style" className="space-y-3">
                {/* Decorations */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Decoration</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={element.style.fontStyle === 'italic' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-8 p-0"
                      onClick={() => updateStyle('fontStyle', element.style.fontStyle === 'italic' ? 'normal' : 'italic')}
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant={element.style.textDecoration === 'underline' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-8 p-0"
                      onClick={() => updateStyle('textDecoration', element.style.textDecoration === 'underline' ? 'none' : 'underline')}
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant={element.style.textDecoration === 'line-through' ? 'default' : 'outline'}
                      size="sm"
                      className="h-7 w-8 p-0"
                      onClick={() => updateStyle('textDecoration', element.style.textDecoration === 'line-through' ? 'none' : 'line-through')}
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Spacing */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Line Height</Label>
                    <Input
                      type="number"
                      step={0.1}
                      value={element.style.lineHeight || 1.4}
                      onChange={(e) => updateStyle('lineHeight', Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Letter Space</Label>
                    <Input
                      type="number"
                      value={element.style.letterSpacing || 0}
                      onChange={(e) => updateStyle('letterSpacing', Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Transform</Label>
                  <Select
                    value={element.style.textTransform || 'none'}
                    onValueChange={(value) => updateStyle('textTransform', value)}
                  >
                    <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="uppercase">UPPERCASE</SelectItem>
                      <SelectItem value="lowercase">lowercase</SelectItem>
                      <SelectItem value="capitalize">Capitalize</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="layout" className="space-y-3">
                {/* Columns */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Columns</Label>
                    <Input
                      type="number"
                      min={1}
                      max={4}
                      value={element.style.columnCount || 1}
                      onChange={(e) => updateStyle('columnCount', Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Gap</Label>
                    <Input
                      type="number"
                      value={element.style.columnGap || 20}
                      onChange={(e) => updateStyle('columnGap', Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>

                {/* Indentation & Padding */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Indent (px)</Label>
                    <Input
                      type="number"
                      value={element.style.textIndent || 0}
                      onChange={(e) => updateStyle('textIndent', Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1.5 block">Padding</Label>
                    <Input
                      type="number"
                      value={element.style.padding || 0}
                      onChange={(e) => updateStyle('padding', Number(e.target.value))}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>

                {/* Link */}
                <div className="pt-1">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Hyperlink</Label>
                  <div className="relative">
                    <LinkIcon className="absolute left-2 top-1.5 w-3 h-3 text-muted-foreground" />
                    <Input
                      value={element.style.linkUrl || ''}
                      onChange={(e) => updateStyle('linkUrl', e.target.value)}
                      placeholder="https://..."
                      className="h-7 text-xs pl-7"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </Section>
        )}

          <Separator />

{/* Content Section */ }
{
  isTextElement && (
    <Section title="Content">
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-[10px]"
          onClick={() => onUpdateElement(element.id, { content: (element.content || '') + '{{page}}' })}
        >
          <Hash className="w-3 h-3 mr-1" />
          Page #
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-[10px]"
          onClick={() => onUpdateElement(element.id, { content: (element.content || '') + '{{total_pages}}' })}
        >
          <Copy className="w-3 h-3 mr-1" />
          Total Pages
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-6 px-2 text-[10px]"
          onClick={() => onUpdateElement(element.id, { content: (element.content || '') + '{{date}}' })}
        >
          <Calendar className="w-3 h-3 mr-1" />
          Date
        </Button>
      </div>
      <textarea
        value={element.content || ''}
        onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
        className="w-full h-24 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Enter content..."
      />

      {element.type === 'dynamic-field' && (
        <div className="mt-2">
          <Label className="text-xs text-muted-foreground mb-1.5 block">Field Name</Label>
          <Input
            value={element.dynamicField || ''}
            onChange={(e) => onUpdateElement(element.id, { dynamicField: e.target.value })}
            placeholder="e.g., customer_name"
            className="h-7 text-xs font-mono"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            This field will be populated via API
          </p>
        </div>
      )}
    </Section>
  )
}

{/* Image Section */ }
{
  isImageElement && (
    <>
      <Section title="Image">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Image URL</Label>
          <Input
            value={element.imageUrl || ''}
            onChange={(e) => onUpdateElement(element.id, { imageUrl: e.target.value })}
            placeholder="https://..."
            className="h-7 text-xs"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Fit Mode</Label>
          <Select
            value={element.objectFit || 'contain'}
            onValueChange={(value) => onUpdateElement(element.id, { objectFit: value as any })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="contain">Contain</SelectItem>
              <SelectItem value="cover">Cover</SelectItem>
              <SelectItem value="fill">Fill</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Flip</Label>
          <div className="flex items-center gap-1">
            <Button
              variant={element.flipHorizontal ? 'default' : 'outline'}
              size="sm"
              className="h-7 flex-1"
              onClick={() => onUpdateElement(element.id, { flipHorizontal: !element.flipHorizontal })}
            >
              <FlipHorizontal2 className="w-3.5 h-3.5 mr-1" />
              Horizontal
            </Button>
            <Button
              variant={element.flipVertical ? 'default' : 'outline'}
              size="sm"
              className="h-7 flex-1"
              onClick={() => onUpdateElement(element.id, { flipVertical: !element.flipVertical })}
            >
              <FlipVertical2 className="w-3.5 h-3.5 mr-1" />
              Vertical
            </Button>
          </div>
        </div>

        {/* Image Filters */}
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs text-muted-foreground block">Filters</Label>

          <div className="flex items-center gap-2">
            <span className="text-xs w-20">Brightness</span>
            <Slider
              value={[element.imageFilters?.brightness || 100]}
              onValueChange={([value]) => onUpdateElement(element.id, {
                imageFilters: { ...element.imageFilters, brightness: value }
              })}
              min={0}
              max={200}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{element.imageFilters?.brightness || 100}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs w-20">Contrast</span>
            <Slider
              value={[element.imageFilters?.contrast || 100]}
              onValueChange={([value]) => onUpdateElement(element.id, {
                imageFilters: { ...element.imageFilters, contrast: value }
              })}
              min={0}
              max={200}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{element.imageFilters?.contrast || 100}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs w-20">Saturation</span>
            <Slider
              value={[element.imageFilters?.saturation || 100]}
              onValueChange={([value]) => onUpdateElement(element.id, {
                imageFilters: { ...element.imageFilters, saturation: value }
              })}
              min={0}
              max={200}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{element.imageFilters?.saturation || 100}%</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs w-20">Blur</span>
            <Slider
              value={[element.imageFilters?.blur || 0]}
              onValueChange={([value]) => onUpdateElement(element.id, {
                imageFilters: { ...element.imageFilters, blur: value }
              })}
              min={0}
              max={20}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{element.imageFilters?.blur || 0}px</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs w-20">Grayscale</span>
            <Slider
              value={[element.imageFilters?.grayscale || 0]}
              onValueChange={([value]) => onUpdateElement(element.id, {
                imageFilters: { ...element.imageFilters, grayscale: value }
              })}
              min={0}
              max={100}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{element.imageFilters?.grayscale || 0}%</span>
          </div>
        </div>
      </Section>
      <Separator />
    </>
  )
}

{/* Shape Section */ }
{
  isShapeElement && (
    <>
      <Section title="Shape">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Shape Type</Label>
          <Select
            value={element.shapeType || 'rectangle'}
            onValueChange={(value) => onUpdateElement(element.id, { shapeType: value as ShapeType })}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rectangle">Rectangle</SelectItem>
              <SelectItem value="circle">Circle</SelectItem>
              <SelectItem value="ellipse">Ellipse</SelectItem>
              <SelectItem value="triangle">Triangle</SelectItem>
              <SelectItem value="diamond">Diamond</SelectItem>
              <SelectItem value="pentagon">Pentagon</SelectItem>
              <SelectItem value="hexagon">Hexagon</SelectItem>
              <SelectItem value="star">Star</SelectItem>
              <SelectItem value="arrow">Arrow</SelectItem>
              <SelectItem value="line">Line</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Stroke Width</Label>
          <div className="flex items-center gap-2">
            <Slider
              value={[element.style.strokeWidth || 0]}
              onValueChange={([value]) => updateStyle('strokeWidth', value)}
              min={0}
              max={20}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-8">{element.style.strokeWidth || 0}px</span>
          </div>
        </div>

        {(element.style.strokeWidth || 0) > 0 && (
          <>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Stroke Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={element.style.strokeColor || '#1a1a1a'}
                  onChange={(e) => updateStyle('strokeColor', e.target.value)}
                  className="w-8 h-7 rounded border cursor-pointer"
                />
                <Input
                  value={element.style.strokeColor || '#1a1a1a'}
                  onChange={(e) => updateStyle('strokeColor', e.target.value)}
                  className="h-7 flex-1 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Stroke Style</Label>
              <Select
                value={element.style.strokeStyle || 'solid'}
                onValueChange={(value) => updateStyle('strokeStyle', value)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </Section>
      <Separator />
    </>
  )
}

{/* List Section */ }
{
  isListElement && (
    <>
      <Section title="List">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">List Type</Label>
          <Select
            value={element.listType || 'bullet'}
            onValueChange={(value) => onUpdateElement(element.id, { listType: value as ListType })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bullet">Bullet Points</SelectItem>
              <SelectItem value="numbered">Numbered</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">List Items</Label>
          <textarea
            value={(element.listItems || []).join('\n')}
            onChange={(e) => onUpdateElement(element.id, {
              listItems: e.target.value.split('\n').filter(item => item.trim())
            })}
            className="w-full h-24 px-2 py-1.5 text-xs border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter each item on a new line"
          />
        </div>
      </Section>
      <Separator />
    </>
  )
}

{/* Barcode Section */ }
{
  isBarcodeElement && (
    <>
      <Section title="Barcode">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Type</Label>
          <Select
            value={element.barcodeType || 'qr'}
            onValueChange={(value) => onUpdateElement(element.id, { barcodeType: value as BarcodeType })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qr">QR Code</SelectItem>
              <SelectItem value="code128">Code 128</SelectItem>
              <SelectItem value="code39">Code 39</SelectItem>
              <SelectItem value="ean13">EAN-13</SelectItem>
              <SelectItem value="upc">UPC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Value</Label>
          <Input
            value={element.barcodeValue || ''}
            onChange={(e) => onUpdateElement(element.id, { barcodeValue: e.target.value })}
            placeholder="Enter barcode value..."
            className="h-7 text-xs"
          />
        </div>
      </Section>
      <Separator />
    </>
  )
}

{/* Table Section */ }
{
  isTableElement && (
    <>
      <Section title="Table">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Rows</Label>
            <Input
              type="number"
              value={element.tableData?.rows || 3}
              onChange={(e) => {
                const rows = Number(e.target.value);
                const currentCells = element.tableData?.cells || [];
                const cols = element.tableData?.cols || 3;
                const newCells = Array(rows).fill(null).map((_, rowIndex) =>
                  Array(cols).fill(null).map((_, colIndex) =>
                    currentCells[rowIndex]?.[colIndex] || { content: '', style: {} }
                  )
                );
                onUpdateElement(element.id, {
                  tableData: { ...element.tableData, rows, cells: newCells }
                });
              }}
              min={1}
              max={20}
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Columns</Label>
            <Input
              type="number"
              value={element.tableData?.cols || 3}
              onChange={(e) => {
                const cols = Number(e.target.value);
                const currentCells = element.tableData?.cells || [];
                const rows = element.tableData?.rows || 3;
                const newCells = Array(rows).fill(null).map((_, rowIndex) =>
                  Array(cols).fill(null).map((_, colIndex) =>
                    currentCells[rowIndex]?.[colIndex] || { content: '', style: {} }
                  )
                );
                onUpdateElement(element.id, {
                  tableData: { ...element.tableData, cols, cells: newCells }
                });
              }}
              min={1}
              max={10}
              className="h-7 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Header Row</Label>
          <Switch
            checked={element.tableData?.headerRow || false}
            onCheckedChange={(checked) => onUpdateElement(element.id, {
              tableData: { ...element.tableData, headerRow: checked }
            })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-xs">Alternating Rows</Label>
          <Switch
            checked={element.tableData?.alternatingRowColors || false}
            onCheckedChange={(checked) => onUpdateElement(element.id, {
              tableData: { ...element.tableData, alternatingRowColors: checked }
            })}
          />
        </div>

        {element.tableData?.alternatingRowColors && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Alt Row Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={element.tableData?.alternatingColor || '#f9fafb'}
                onChange={(e) => onUpdateElement(element.id, {
                  tableData: { ...element.tableData, alternatingColor: e.target.value }
                })}
                className="w-8 h-7 rounded border cursor-pointer"
              />
              <Input
                value={element.tableData?.alternatingColor || '#f9fafb'}
                onChange={(e) => onUpdateElement(element.id, {
                  tableData: { ...element.tableData, alternatingColor: e.target.value }
                })}
                className="h-7 flex-1 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </Section>
      <Separator />
    </>
  )
}

{/* Content Section */ }
{
  isTextElement && (
    <Section title="Content">
      <textarea
        value={element.content || ''}
        onChange={(e) => onUpdateElement(element.id, { content: e.target.value })}
        className="w-full h-24 px-3 py-2 text-sm border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary"
        placeholder="Enter content..."
      />

      {element.type === 'dynamic-field' && (
        <div className="mt-2">
          <Label className="text-xs text-muted-foreground mb-1.5 block">Field Name</Label>
          <Input
            value={element.dynamicField || ''}
            onChange={(e) => onUpdateElement(element.id, { dynamicField: e.target.value })}
            placeholder="e.g., customer_name"
            className="h-7 text-xs font-mono"
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            This field will be populated via API
          </p>
        </div>
      )}
    </Section>
  )
}

{/* Watermark Section */ }
{
  element.type === 'watermark' && (
    <Section title="Watermark">
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Pattern</Label>
        <Select
          value={element.watermarkPattern || 'single'}
          onValueChange={(value) => onUpdateElement(element.id, {
            watermarkPattern: value as 'single' | 'tiled'
          })}
        >
          <SelectTrigger className="h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="tiled">Tiled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">Watermark Opacity</Label>
        <div className="flex items-center gap-2">
          <Slider
            value={[(element.watermarkOpacity ?? 0.1) * 100]}
            onValueChange={([value]) => onUpdateElement(element.id, {
              watermarkOpacity: value / 100
            })}
            min={1}
            max={50}
            className="flex-1"
          />
          <span className="text-xs text-muted-foreground w-10 text-right">
            {Math.round((element.watermarkOpacity ?? 0.1) * 100)}%
          </span>
        </div>
      </div>
    </Section>
  )
}
        </div >
      </ScrollArea >
    </div >
  );
};
