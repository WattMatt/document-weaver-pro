import React from 'react';
import {
  Pencil,
  Highlighter,
  Eraser,
  ArrowRight,
  Minus,
  X,
} from 'lucide-react';
import { DrawingTool } from '@/types/editor';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';

interface DrawingToolbarProps {
  isActive: boolean;
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  onToggleActive: () => void;
  onToolChange: (tool: DrawingTool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onClear: () => void;
}

const tools: { id: DrawingTool; label: string; icon: React.ReactNode }[] = [
  { id: 'pen', label: 'Pen', icon: <Pencil className="w-4 h-4" /> },
  { id: 'highlighter', label: 'Highlighter', icon: <Highlighter className="w-4 h-4" /> },
  { id: 'eraser', label: 'Eraser', icon: <Eraser className="w-4 h-4" /> },
  { id: 'line', label: 'Line', icon: <Minus className="w-4 h-4" /> },
  { id: 'arrow', label: 'Arrow', icon: <ArrowRight className="w-4 h-4" /> },
];

const colors = [
  '#000000',
  '#374151',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
];

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  isActive,
  tool,
  color,
  strokeWidth,
  onToggleActive,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onClear,
}) => {
  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-50",
        "bg-popover border shadow-lg rounded-xl p-2",
        "flex items-center gap-2",
        "transition-all duration-200",
        isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      {/* Drawing Tools */}
      <div className="flex items-center gap-1 border-r pr-2">
        {tools.map((t) => (
          <Tooltip key={t.id}>
            <TooltipTrigger asChild>
              <Button
                variant={tool === t.id ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onToolChange(t.id)}
              >
                {t.icon}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Color Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <div
              className="w-5 h-5 rounded-full border"
              style={{ backgroundColor: color }}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center">
          <div className="grid grid-cols-5 gap-1">
            {colors.map((c) => (
              <button
                key={c}
                className={cn(
                  "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                  color === c ? "border-primary scale-110" : "border-transparent"
                )}
                style={{ backgroundColor: c }}
                onClick={() => onColorChange(c)}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Stroke Width */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 px-3">
            <div
              className="rounded-full bg-current"
              style={{
                width: Math.min(strokeWidth * 2, 16),
                height: Math.min(strokeWidth * 2, 16),
              }}
            />
            <span className="ml-2 text-xs">{strokeWidth}px</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-3" align="center">
          <div className="space-y-2">
            <Label className="text-xs">Stroke Width</Label>
            <Slider
              value={[strokeWidth]}
              onValueChange={([value]) => onStrokeWidthChange(value)}
              min={1}
              max={20}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1px</span>
              <span>20px</span>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear & Close */}
      <div className="flex items-center gap-1 border-l pl-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-destructive hover:text-destructive"
              onClick={onClear}
            >
              Clear
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear all drawings</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onToggleActive}
            >
              <X className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Exit drawing mode</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};
