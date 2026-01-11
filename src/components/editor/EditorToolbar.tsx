import React, { useState } from 'react';
import {
  Save,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Magnet,
  Undo,
  Redo,
  Eye,
  FileText,
  Plus,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  templateName: string;
  zoom: number;
  showGrid: boolean;
  snapToGrid: boolean;
  onZoomChange: (zoom: number) => void;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onSave: () => void;
  onPreview: () => void;
  onNewTemplate: () => void;
  onUpdateName?: (name: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  onCopyStyle: () => void;
  onPasteStyle: () => void;
  onFindAndReplace: (find: string, replace: string) => void;
}

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Paintbrush, Search, RotateCcw, RotateCw, Replace } from 'lucide-react';

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  templateName,
  zoom,
  showGrid,
  snapToGrid,
  onZoomChange,
  onToggleGrid,
  onToggleSnap,
  onSave,
  onPreview,
  onNewTemplate,
  onUpdateName,
  onUndo,
  onRedo,
  onCopyStyle,
  onPasteStyle,
  onFindAndReplace,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  return (
    <div className="h-14 bg-toolbar border-b border-sidebar-border flex items-center px-4 gap-2">
      {/* Logo/Brand */}
      <div className="flex items-center gap-2 pr-4 border-r border-sidebar-border">
        <FileText className="w-5 h-5 text-primary" />
        <span className="font-semibold text-sm">DocBuilder</span>
      </div>

      {/* File Actions */}
      <div className="flex items-center gap-1 px-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onNewTemplate}>
              Blank Template
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Invoice Template</DropdownMenuItem>
            <DropdownMenuItem>Report Template</DropdownMenuItem>
            <DropdownMenuItem>Contract Template</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={onSave}>
              <Save className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save Template</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <Download className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export PDF</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Edit Tools */}
      <div className="flex items-center gap-1 px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onUndo}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onRedo}>
              <RotateCw className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onCopyStyle}>
              <Paintbrush className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy Style</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onPasteStyle}>
              <Paintbrush className="w-4 h-4 text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Paste Style</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Search className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3" align="start">
                  <div className="grid gap-2">
                    <div className="space-y-1">
                      <h4 className="font-medium leading-none text-xs">Find & Replace</h4>
                    </div>
                    <div className="grid gap-2">
                      <Input
                        placeholder="Find..."
                        value={findText}
                        onChange={(e) => setFindText(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Input
                        placeholder="Replace with..."
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        className="h-8 text-xs"
                      />
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => onFindAndReplace(findText, replaceText)}
                      >
                        <Replace className="w-3 h-3 mr-1" />
                        Replace All
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </span>
          </TooltipTrigger>
          <TooltipContent>Find & Replace</TooltipContent>
        </Tooltip>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Template Name */}
      <div className="flex-1 flex items-center justify-center">
        {isEditingName ? (
          <Input
            value={templateName}
            onChange={(e) => onUpdateName(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
            className="h-7 w-64 text-center text-sm"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            className="text-sm font-medium hover:text-primary transition-colors px-2 py-1 rounded hover:bg-muted"
          >
            {templateName}
          </button>
        )}
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* View Controls */}
      <div className="flex items-center gap-1 px-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2", showGrid && "bg-muted")}
              onClick={onToggleGrid}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Grid</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-8 px-2", snapToGrid && "bg-muted")}
              onClick={onToggleSnap}
            >
              <Magnet className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Snap to Grid</TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-1 ml-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onZoomChange(zoom - 10)}
                disabled={zoom <= 25}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          <span className="text-xs font-medium w-12 text-center">{zoom}%</span>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onZoomChange(zoom + 10)}
                disabled={zoom >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8" onClick={onPreview}>
          <Eye className="w-4 h-4 mr-1.5" />
          Preview
        </Button>
        <Button size="sm" className="h-8">
          <Download className="w-4 h-4 mr-1.5" />
          Generate PDF
        </Button>
      </div>
    </div>
  );
};
