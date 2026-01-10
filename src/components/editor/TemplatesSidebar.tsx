import React from 'react';
import { FileText, Plus, Clock, Trash2 } from 'lucide-react';
import { Template } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface TemplatesSidebarProps {
  templates: Template[];
  currentTemplateId: string | null;
  onSelectTemplate: (template: Template) => void;
  onCreateNew: () => void;
}

export const TemplatesSidebar: React.FC<TemplatesSidebarProps> = ({
  templates,
  currentTemplateId,
  onSelectTemplate,
  onCreateNew,
}) => {
  return (
    <div className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col h-full">
      <div className="panel-header flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span>Templates</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onCreateNew}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
        {templates.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            <p>No saved templates</p>
            <Button variant="link" size="sm" className="mt-2" onClick={onCreateNew}>
              Create your first template
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

      <div className="p-3 border-t border-sidebar-border">
        <Button variant="outline" className="w-full justify-start" size="sm" onClick={onCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>
    </div>
  );
};
