import React, { useState, useEffect, useCallback } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { ElementsPalette } from '@/components/editor/ElementsPalette';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { PreviewPanel } from '@/components/editor/PreviewPanel';
import { TemplatesSidebar } from '@/components/editor/TemplatesSidebar';
import { LayersPanel } from '@/components/editor/LayersPanel';
import { PagesPanel } from '@/components/editor/PagesPanel';
import { StylePresetsPanel } from '@/components/editor/StylePresetsPanel';
import { DrawingToolbar } from '@/components/editor/DrawingToolbar';
import { DocumentPropertiesDialog } from '@/components/editor/DocumentPropertiesDialog';
import { ExportDialog } from '@/components/editor/ExportDialog';
import { ElementType, ExportSettings, DocumentProperties } from '@/types/editor';
import { PptxExportService } from '@/services/pptx/PptxExportService';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  LayoutGrid, 
  Layers, 
  FileText, 
  Palette,
  Pencil,
  Settings,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const Editor: React.FC = () => {
  const {
    state,
    templates,
    selectedElement,
    currentPage,
    drawingPaths,
    setDrawingPaths,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    selectElement,
    reorderElement,
    bringToFront,
    sendToBack,
    setZoom,
    toggleGrid,
    toggleSnapToGrid,
    updateTemplateName,
    saveTemplate,
    loadTemplate,
    createNewTemplate,
    createNewPresentation,
    addPage,
    deletePage,
    duplicatePage,
    reorderPage,
    renamePage,
    rotatePage,
    selectPage,
    toggleDrawingMode,
    setDrawingTool,
    setDrawingColor,
    setDrawingWidth,
    clearDrawings,
    updateDocumentProperties,
    setActivePanel,
    copyStyle,
    pasteStyle,
    applyStylePreset,
    undo,
    redo,
    findAndReplace,
  } = useEditorState();

  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDocProperties, setShowDocProperties] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [activeLeftPanel, setActiveLeftPanel] = useState<'elements' | 'layers' | 'pages' | 'styles'>('elements');

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // Ctrl/Cmd + Z - Undo
    if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
      return;
    }

    // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z - Redo
    if ((ctrlOrCmd && e.key.toLowerCase() === 'y') || (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'z')) {
      e.preventDefault();
      redo();
      return;
    }

    // Ctrl/Cmd + D - Duplicate
    if (ctrlOrCmd && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      if (state.selectedElementId) {
        duplicateElement(state.selectedElementId);
        toast.success('Element duplicated');
      }
      return;
    }

    // Delete or Backspace - Delete element
    if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedElementId) {
      e.preventDefault();
      deleteElement(state.selectedElementId);
      toast.success('Element deleted');
      return;
    }

    // Ctrl/Cmd + S - Save
    if (ctrlOrCmd && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveTemplate();
      return;
    }

    // Ctrl/Cmd + E - Export
    if (ctrlOrCmd && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      setShowExportDialog(true);
      return;
    }

    // Ctrl/Cmd + P - Preview
    if (ctrlOrCmd && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      setShowPreview(true);
      return;
    }

    // Ctrl/Cmd + Shift + D - Toggle drawing mode
    if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      toggleDrawingMode();
      return;
    }

    // Escape - Deselect or exit drawing mode
    if (e.key === 'Escape') {
      if (state.isDrawingMode) {
        toggleDrawingMode();
      } else {
        selectElement(null);
      }
      return;
    }

    // [ and ] - Bring forward / send backward
    if (e.key === '[' && state.selectedElementId) {
      e.preventDefault();
      reorderElement(state.selectedElementId, 'down');
      return;
    }
    if (e.key === ']' && state.selectedElementId) {
      e.preventDefault();
      reorderElement(state.selectedElementId, 'up');
      return;
    }

    // Number keys 1-4 to switch panels
    if (e.key === '1' && !ctrlOrCmd) {
      setActiveLeftPanel('elements');
      return;
    }
    if (e.key === '2' && !ctrlOrCmd) {
      setActiveLeftPanel('layers');
      return;
    }
    if (e.key === '3' && !ctrlOrCmd) {
      setActiveLeftPanel('pages');
      return;
    }
    if (e.key === '4' && !ctrlOrCmd) {
      setActiveLeftPanel('styles');
      return;
    }
  }, [state.selectedElementId, state.isDrawingMode, undo, redo, duplicateElement, deleteElement, saveTemplate, selectElement, toggleDrawingMode, reorderElement]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAddElement = (type: ElementType) => {
    addElement(type);
  };

  const handleExportPptx = async () => {
    if (!state.currentTemplate) return;
    try {
      await PptxExportService.exportToPptx(state.currentTemplate);
      toast.success('Presentation exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export presentation');
    }
  };

  const handleExport = (settings: ExportSettings) => {
    if (!state.currentTemplate) return;
    
    // For now, just show a success message - actual export logic would go here
    if (settings.format === 'pptx') {
      handleExportPptx();
    } else {
      toast.success(`Exporting as ${settings.format.toUpperCase()}...`);
    }
  };

  const handleSaveDocProperties = (properties: DocumentProperties) => {
    updateDocumentProperties(properties);
    toast.success('Document properties saved');
  };

  const pages = state.currentTemplate?.pages || [];
  const currentPageId = pages[state.currentTemplate?.currentPageIndex || 0]?.id || null;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Toolbar */}
      <EditorToolbar
        templateName={state.currentTemplate?.name || 'Untitled'}
        zoom={state.zoom}
        showGrid={state.showGrid}
        snapToGrid={state.snapToGrid}
        onZoomChange={setZoom}
        onToggleGrid={toggleGrid}
        onToggleSnap={toggleSnapToGrid}
        onSave={saveTemplate}
        onPreview={() => setShowPreview(true)}
        onNewTemplate={createNewTemplate}
        onNewPresentation={createNewPresentation}
        onExportPptx={handleExportPptx}
        onUpdateName={updateTemplateName}
        onUndo={undo}
        onRedo={redo}
        onCopyStyle={() => state.selectedElementId && copyStyle(state.selectedElementId)}
        onPasteStyle={() => state.selectedElementId && pasteStyle(state.selectedElementId)}
        onFindAndReplace={findAndReplace}
      />

      {/* Secondary Toolbar */}
      <div className="h-10 bg-muted/30 border-b flex items-center px-4 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={state.isDrawingMode ? 'default' : 'ghost'}
              size="sm"
              className="h-7 gap-1"
              onClick={toggleDrawingMode}
            >
              <Pencil className="w-3.5 h-3.5" />
              Draw
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle drawing mode (Ctrl+Shift+D)</TooltipContent>
        </Tooltip>

        <div className="h-4 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1"
              onClick={() => setShowDocProperties(true)}
            >
              <Settings className="w-3.5 h-3.5" />
              Properties
            </Button>
          </TooltipTrigger>
          <TooltipContent>Document Properties</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1"
              onClick={() => setShowExportDialog(true)}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export document (Ctrl+E)</TooltipContent>
        </Tooltip>

        <div className="flex-1" />

        <span className="text-xs text-muted-foreground">
          {state.currentTemplate?.elements.length || 0} elements
          {pages.length > 1 && ` • ${pages.length} pages`}
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Templates Sidebar (optional) */}
        {showTemplates && (
          <TemplatesSidebar
            templates={templates}
            currentTemplateId={state.currentTemplate?.id || null}
            currentTemplate={state.currentTemplate}
            onSelectTemplate={loadTemplate}
            onCreateNew={createNewTemplate}
            onImportTemplate={(result) => {
              if (result.success && result.template) {
                loadTemplate(result.template);
              }
            }}
          />
        )}

        {/* Left Panel - Tabbed Elements/Layers/Pages/Styles */}
        <div className="w-60 border-r border-sidebar-border bg-sidebar flex-shrink-0 flex flex-col">
          {/* Panel Tabs */}
          <div className="flex border-b border-sidebar-border">
            {[
              { id: 'elements', icon: LayoutGrid, label: 'Elements' },
              { id: 'layers', icon: Layers, label: 'Layers' },
              { id: 'pages', icon: FileText, label: 'Pages' },
              { id: 'styles', icon: Palette, label: 'Styles' },
            ].map((panel) => (
              <Tooltip key={panel.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveLeftPanel(panel.id as typeof activeLeftPanel)}
                    className={cn(
                      "flex-1 py-2 flex items-center justify-center transition-colors",
                      activeLeftPanel === panel.id
                        ? "bg-primary/10 text-primary border-b-2 border-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <panel.icon className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{panel.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeLeftPanel === 'elements' && (
              <ElementsPalette onAddElement={handleAddElement} />
            )}
            {activeLeftPanel === 'layers' && (
              <LayersPanel
                elements={state.currentTemplate?.elements || []}
                selectedElementId={state.selectedElementId}
                onSelectElement={selectElement}
                onUpdateElement={updateElement}
                onDeleteElement={deleteElement}
                onDuplicateElement={duplicateElement}
                onReorderElement={reorderElement}
              />
            )}
            {activeLeftPanel === 'pages' && (
              <PagesPanel
                pages={pages}
                currentPageId={currentPageId}
                onSelectPage={selectPage}
                onAddPage={addPage}
                onDeletePage={deletePage}
                onDuplicatePage={duplicatePage}
                onReorderPage={reorderPage}
                onRenamePage={renamePage}
                onRotatePage={rotatePage}
              />
            )}
            {activeLeftPanel === 'styles' && (
              <StylePresetsPanel
                selectedElementId={state.selectedElementId}
                currentStyle={selectedElement?.style}
                onApplyPreset={applyStylePreset}
              />
            )}
          </div>
        </div>

        {/* Canvas */}
        <EditorCanvas
          template={state.currentTemplate}
          selectedElementId={state.selectedElementId}
          zoom={state.zoom}
          showGrid={state.showGrid}
          onSelectElement={selectElement}
          onUpdateElement={updateElement}
        />

        {/* Right Panel - Properties */}
        <div className="w-72 border-l border-sidebar-border bg-sidebar flex-shrink-0">
          <PropertiesPanel
            element={selectedElement}
            onUpdateElement={updateElement}
            onDeleteElement={deleteElement}
            onDuplicateElement={duplicateElement}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            onBringForward={(id) => reorderElement(id, 'up')}
            onSendBackward={(id) => reorderElement(id, 'down')}
          />
        </div>
      </div>

      {/* Drawing Toolbar */}
      <DrawingToolbar
        isActive={state.isDrawingMode || false}
        tool={state.currentDrawingTool || 'pen'}
        color={state.drawingColor || '#000000'}
        strokeWidth={state.drawingWidth || 2}
        onToggleActive={toggleDrawingMode}
        onToolChange={setDrawingTool}
        onColorChange={setDrawingColor}
        onStrokeWidthChange={setDrawingWidth}
        onClear={clearDrawings}
      />

      {/* Modals */}
      <PreviewPanel
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        template={state.currentTemplate}
      />

      <DocumentPropertiesDialog
        isOpen={showDocProperties}
        onClose={() => setShowDocProperties(false)}
        properties={state.currentTemplate?.documentProperties || {}}
        onSave={handleSaveDocProperties}
      />

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default Editor;
