import React, { useState } from 'react';
import { FileText, Plus, Clock, Download, Upload, MoreVertical } from 'lucide-react';
import { Template, TemplateImportResult } from '@/types/editor';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { TemplateExportDialog } from './TemplateExportDialog';
import { triggerFileImport } from '@/lib/templateImporter';
import { downloadTemplatesBundle } from '@/lib/templateExporter';
import { useToast } from '@/hooks/use-toast';

interface TemplatesSidebarProps {
  templates: Template[];
  currentTemplateId: string | null;
  currentTemplate: Template | null;
  onSelectTemplate: (template: Template) => void;
  onCreateNew: () => void;
  onImportTemplate?: (result: TemplateImportResult) => void;
}

export const TemplatesSidebar: React.FC<TemplatesSidebarProps> = ({
  templates,
  currentTemplateId,
  currentTemplate,
  onSelectTemplate,
  onCreateNew,
  onImportTemplate,
}) => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleImportTemplate = () => {
    triggerFileImport((result) => {
      if (result.success && result.template) {
        if (onImportTemplate) {
          onImportTemplate(result);
        }
        toast({
          title: 'Template imported',
          description: `"${result.template.name}" has been imported successfully.`,
        });
      } else {
        toast({
          title: 'Import failed',
          description: result.errors?.join(', ') || 'Unknown error',
          variant: 'destructive',
        });
      }
    });
  };

  const handleExportAll = () => {
    if (templates.length === 0) {
      toast({
        title: 'No templates',
        description: 'No templates available to export.',
        variant: 'destructive',
      });
      return;
    }
    downloadTemplatesBundle(templates, 'all-templates.json');
    toast({
      title: 'Export complete',
      description: `Exported ${templates.length} templates.`,
    });
  };

  return (
    <>
      <div className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col h-full">
        <div className="panel-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span>Templates</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCreateNew}>
              <Plus className="w-4 h-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleImportTemplate}>
                  <Upload className="w-4 h-4 mr-2" />
                  Import Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setExportDialogOpen(true)}
                  disabled={!currentTemplate}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Current
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleExportAll}
                  disabled={templates.length === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {templates.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <p>No saved templates</p>
              <Button variant="link" size="sm" className="mt-2" onClick={onCreateNew}>
                Create your first template
              </Button>
              <Button variant="link" size="sm" className="mt-1" onClick={handleImportTemplate}>
                Or import one
              </Button>
            </div>
          ) : (
            templates.map((template) => (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className={cn(
                  "w-full p-3 rounded-lg text-left transition-colors",
                  "hover:bg-sidebar-accent",
                  currentTemplateId === template.id && "bg-sidebar-accent border border-primary/20"
                )}
              >
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{template.name}</p>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(template.updatedAt, { addSuffix: true })}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-muted rounded">
                        {template.pageSize}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {template.elements.length} elements
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t border-sidebar-border space-y-2">
          <Button variant="outline" className="w-full justify-start" size="sm" onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-2" />
            New Template
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={handleImportTemplate}
          >
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
        </div>
      </div>

      <TemplateExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        template={currentTemplate}
      />
    </>
  );
};
