import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  RotateCw,
  MoreHorizontal,
} from 'lucide-react';
import { Page } from '@/types/editor';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { v4 as uuidv4 } from 'uuid';

interface PagesPanelProps {
  pages: Page[];
  currentPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onReorderPage: (pageId: string, direction: 'up' | 'down') => void;
  onRenamePage: (pageId: string, name: string) => void;
  onRotatePage: (pageId: string) => void;
}

export const PagesPanel: React.FC<PagesPanelProps> = ({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onDuplicatePage,
  onReorderPage,
  onRenamePage,
  onRotatePage,
}) => {
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleStartRename = (page: Page) => {
    setEditingPageId(page.id);
    setEditingName(page.name);
  };

  const handleFinishRename = (pageId: string) => {
    if (editingName.trim()) {
      onRenamePage(pageId, editingName.trim());
    }
    setEditingPageId(null);
    setEditingName('');
  };

  return (
    <div className="h-full flex flex-col">
      <div className="panel-header flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <span>Pages</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {pages.length} {pages.length === 1 ? 'page' : 'pages'}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {pages.map((page, index) => (
            <div
              key={page.id}
              className={cn(
                "group relative rounded-lg border-2 transition-all cursor-pointer overflow-hidden",
                currentPageId === page.id
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-muted-foreground/20"
              )}
              onClick={() => onSelectPage(page.id)}
            >
              {/* Page Thumbnail */}
              <div className="aspect-[8.5/11] bg-white dark:bg-muted/50 rounded-md relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    {page.elements.length} elements
                  </span>
                </div>

                {/* Page Number Badge */}
                <div className="absolute top-1 left-1 w-5 h-5 bg-primary/10 rounded text-xs font-medium flex items-center justify-center text-primary">
                  {index + 1}
                </div>

                {/* Rotation Indicator */}
                {page.rotation && (
                  <div className="absolute top-1 right-1 w-5 h-5 bg-muted rounded text-xs font-medium flex items-center justify-center">
                    {page.rotation}°
                  </div>
                )}
              </div>

              {/* Page Name */}
              <div className="p-1.5">
                {editingPageId === page.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleFinishRename(page.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFinishRename(page.id);
                      if (e.key === 'Escape') setEditingPageId(null);
                    }}
                    className="h-6 text-xs"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate flex-1">
                      {page.name}
                    </span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleStartRename(page)}>
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDuplicatePage(page.id)}>
                          <Copy className="w-3.5 h-3.5 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRotatePage(page.id)}>
                          <RotateCw className="w-3.5 h-3.5 mr-2" />
                          Rotate 90°
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onReorderPage(page.id, 'up')} disabled={index === 0}>
                          <ChevronUp className="w-3.5 h-3.5 mr-2" />
                          Move Up
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onReorderPage(page.id, 'down')} disabled={index === pages.length - 1}>
                          <ChevronDown className="w-3.5 h-3.5 mr-2" />
                          Move Down
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDeletePage(page.id)}
                          className="text-destructive"
                          disabled={pages.length <= 1}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Add Page Button */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-8"
          onClick={onAddPage}
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Page
        </Button>
      </div>
    </div>
  );
};
