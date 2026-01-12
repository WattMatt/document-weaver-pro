import React, { useState } from 'react';
import {
  Palette,
  Plus,
  Trash2,
  Check,
  ChevronDown,
} from 'lucide-react';
import { StylePreset, ElementStyle, DEFAULT_STYLE_PRESETS } from '@/types/editor';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { v4 as uuidv4 } from 'uuid';

interface StylePresetsPanelProps {
  selectedElementId: string | null;
  currentStyle?: ElementStyle;
  onApplyPreset: (style: Partial<ElementStyle>) => void;
  onSavePreset?: (preset: StylePreset) => void;
}

const categories = [
  { id: 'heading', label: 'Headings' },
  { id: 'text', label: 'Text' },
  { id: 'button', label: 'Buttons' },
  { id: 'shape', label: 'Shapes' },
  { id: 'custom', label: 'Custom' },
];

export const StylePresetsPanel: React.FC<StylePresetsPanelProps> = ({
  selectedElementId,
  currentStyle,
  onApplyPreset,
  onSavePreset,
}) => {
  const [presets, setPresets] = useState<StylePreset[]>(DEFAULT_STYLE_PRESETS);
  const [customPresets, setCustomPresets] = useState<StylePreset[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetCategory, setNewPresetCategory] = useState<StylePreset['category']>('custom');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['heading', 'text']);

  const handleSavePreset = () => {
    if (!currentStyle || !newPresetName.trim()) return;

    const newPreset: StylePreset = {
      id: uuidv4(),
      name: newPresetName.trim(),
      category: newPresetCategory,
      style: { ...currentStyle },
    };

    setCustomPresets((prev) => [...prev, newPreset]);
    onSavePreset?.(newPreset);
    setNewPresetName('');
    setIsDialogOpen(false);
  };

  const handleDeleteCustomPreset = (presetId: string) => {
    setCustomPresets((prev) => prev.filter((p) => p.id !== presetId));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const allPresets = [...presets, ...customPresets];

  const renderPresetPreview = (preset: StylePreset) => {
    const style = preset.style;
    return (
      <div
        className="px-3 py-2 rounded text-sm truncate"
        style={{
          fontSize: style.fontSize ? Math.min(style.fontSize, 14) : 14,
          fontWeight: style.fontWeight as any,
          fontStyle: style.fontStyle,
          color: style.color || '#374151',
          backgroundColor: style.backgroundColor || 'transparent',
          borderRadius: style.borderRadius,
          border: style.borderWidth ? `${style.borderWidth}px solid ${style.borderColor || '#e5e7eb'}` : undefined,
        }}
      >
        {preset.name}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header flex items-center gap-2">
        <Palette className="w-4 h-4 text-primary" />
        <span>Style Presets</span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {categories.map((category) => {
            const categoryPresets = allPresets.filter((p) => p.category === category.id);
            if (categoryPresets.length === 0 && category.id !== 'custom') return null;

            return (
              <Collapsible
                key={category.id}
                open={expandedCategories.includes(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
                  <span>{category.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 transition-transform",
                      expandedCategories.includes(category.id) && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 pt-1">
                  {categoryPresets.map((preset) => (
                    <div
                      key={preset.id}
                      className={cn(
                        "group relative rounded-md border border-transparent transition-all cursor-pointer",
                        "hover:border-primary/30 hover:bg-muted/30",
                        !selectedElementId && "opacity-50 cursor-not-allowed"
                      )}
                      onClick={() => selectedElementId && onApplyPreset(preset.style)}
                    >
                      {renderPresetPreview(preset)}
                      
                      {/* Delete button for custom presets */}
                      {customPresets.some((p) => p.id === preset.id) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCustomPreset(preset.id);
                          }}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {category.id === 'custom' && categoryPresets.length === 0 && (
                    <p className="text-xs text-muted-foreground py-2 text-center">
                      No custom presets yet
                    </p>
                  )}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      {/* Save Current Style as Preset */}
      <div className="p-3">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8"
              disabled={!selectedElementId || !currentStyle}
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Save Current Style
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Style Preset</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Preset Name</Label>
                <Input
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="My Custom Style"
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={newPresetCategory}
                  onValueChange={(value) => setNewPresetCategory(value as StylePreset['category'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSavePreset} disabled={!newPresetName.trim()}>
                  <Check className="w-4 h-4 mr-1" />
                  Save Preset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
