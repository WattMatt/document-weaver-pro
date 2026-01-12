import React, { useState, useEffect, useCallback } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { useAnnouncer } from '@/hooks/useAnnouncer';
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
import { KeyboardShortcutsDialog } from '@/components/editor/KeyboardShortcutsDialog';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { ElementType, ExportSettings, DocumentProperties } from '@/types/editor';
import { PptxExportService } from '@/services/pptx/PptxExportService';
import { toast } from 'sonner';
import { 
  LayoutGrid, 
  Layers, 
  FileText, 
  Palette,
  Pencil,
  Settings,
  Download,
  Keyboard,
  Menu,
  X,
  PanelLeftClose,
  PanelRightClose,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

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

  const { announcePolite, announceAssertive } = useAnnouncer();
  const isMobile = useIsMobile();

  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDocProperties, setShowDocProperties] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [activeLeftPanel, setActiveLeftPanel] = useState<'elements' | 'layers' | 'pages' | 'styles'>('elements');
  const [leftPanelOpen, setLeftPanelOpen] = useState(!isMobile);
  const [rightPanelOpen, setRightPanelOpen] = useState(!isMobile);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update panel visibility on mobile change
  useEffect(() => {
    setLeftPanelOpen(!isMobile);
    setRightPanelOpen(!isMobile);
  }, [isMobile]);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

    // ? - Show keyboard shortcuts
    if (e.key === '?' && !ctrlOrCmd) {
      e.preventDefault();
      setShowKeyboardShortcuts(true);
      return;
    }

    // Ctrl/Cmd + Z - Undo
    if (ctrlOrCmd && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      undo();
      announcePolite('Undo action performed');
      return;
    }

    // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z - Redo
    if ((ctrlOrCmd && e.key.toLowerCase() === 'y') || (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'z')) {
      e.preventDefault();
      redo();
      announcePolite('Redo action performed');
      return;
    }

    // Ctrl/Cmd + D - Duplicate
    if (ctrlOrCmd && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      if (state.selectedElementId) {
        duplicateElement(state.selectedElementId);
        toast.success('Element duplicated');
        announcePolite('Element duplicated');
      }
      return;
    }

    // Delete or Backspace - Delete element
    if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedElementId) {
      e.preventDefault();
      deleteElement(state.selectedElementId);
      toast.success('Element deleted');
      announcePolite('Element deleted');
      return;
    }

    // Ctrl/Cmd + S - Save
    if (ctrlOrCmd && e.key.toLowerCase() === 's') {
      e.preventDefault();
      saveTemplate();
      announcePolite('Template saved');
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
      announcePolite(state.isDrawingMode ? 'Drawing mode disabled' : 'Drawing mode enabled');
      return;
    }

    // Escape - Deselect or exit drawing mode
    if (e.key === 'Escape') {
      if (state.isDrawingMode) {
        toggleDrawingMode();
        announcePolite('Drawing mode disabled');
      } else {
        selectElement(null);
        announcePolite('Element deselected');
      }
      return;
    }

    // [ and ] - Bring forward / send backward
    if (e.key === '[' && state.selectedElementId) {
      e.preventDefault();
      reorderElement(state.selectedElementId, 'down');
      announcePolite('Element sent backward');
      return;
    }
    if (e.key === ']' && state.selectedElementId) {
      e.preventDefault();
      reorderElement(state.selectedElementId, 'up');
      announcePolite('Element brought forward');
      return;
    }

    // Number keys 1-4 to switch panels
    if (e.key === '1' && !ctrlOrCmd) {
      setActiveLeftPanel('elements');
      announcePolite('Elements panel selected');
      return;
    }
    if (e.key === '2' && !ctrlOrCmd) {
      setActiveLeftPanel('layers');
      announcePolite('Layers panel selected');
      return;
    }
    if (e.key === '3' && !ctrlOrCmd) {
      setActiveLeftPanel('pages');
      announcePolite('Pages panel selected');
      return;
    }
    if (e.key === '4' && !ctrlOrCmd) {
      setActiveLeftPanel('styles');
      announcePolite('Styles panel selected');
      return;
    }
  }, [state.selectedElementId, state.isDrawingMode, undo, redo, duplicateElement, deleteElement, saveTemplate, selectElement, toggleDrawingMode, reorderElement, announcePolite]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleAddElement = (type: ElementType) => {
    addElement(type);
    announcePolite(`${type} element added`);
  };

  const handleExportPptx = async () => {
    if (!state.currentTemplate) return;
    try {
      await PptxExportService.exportToPptx(state.currentTemplate);
      toast.success('Presentation exported successfully');
      announcePolite('Presentation exported');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export presentation');
      announceAssertive('Export failed');
    }
  };

  const handleExport = (settings: ExportSettings) => {
    if (!state.currentTemplate) return;
    
    if (settings.format === 'pptx') {
      handleExportPptx();
    } else {
      toast.success(`Exporting as ${settings.format.toUpperCase()}...`);
      announcePolite(`Exporting as ${settings.format}`);
    }
  };

  const handleSaveDocProperties = (properties: DocumentProperties) => {
    updateDocumentProperties(properties);
    toast.success('Document properties saved');
    announcePolite('Document properties saved');
  };

  const pages = state.currentTemplate?.pages || [];
  const currentPageId = pages[state.currentTemplate?.currentPageIndex || 0]?.id || null;

  const panelTabs = [
    { id: 'elements' as const, icon: LayoutGrid, label: 'Elements', shortcut: '1' },
    { id: 'layers' as const, icon: Layers, label: 'Layers', shortcut: '2' },
    { id: 'pages' as const, icon: FileText, label: 'Pages', shortcut: '3' },
    { id: 'styles' as const, icon: Palette, label: 'Styles', shortcut: '4' },
  ];

  const LeftPanelContent = () => (
    <>
      {/* Panel Tabs */}
      <div 
        className="flex border-b border-sidebar-border"
        role="tablist"
        aria-label="Editor panels"
      >
        {panelTabs.map((panel) => (
          <Tooltip key={panel.id}>
            <TooltipTrigger asChild>
              <button
                role="tab"
                id={`tab-${panel.id}`}
                aria-selected={activeLeftPanel === panel.id}
                aria-controls={`panel-${panel.id}`}
                tabIndex={activeLeftPanel === panel.id ? 0 : -1}
                onClick={() => {
                  setActiveLeftPanel(panel.id);
                  announcePolite(`${panel.label} panel selected`);
                }}
                className={cn(
                  "flex-1 py-2 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  activeLeftPanel === panel.id
                    ? "bg-primary/10 text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <panel.icon className="w-4 h-4" aria-hidden="true" />
                <span className="sr-only">{panel.label} (press {panel.shortcut})</span>
              </button>
            </TooltipTrigger>
            <TooltipContent>{panel.label} (Press {panel.shortcut})</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Panel Content */}
      <div 
        className="flex-1 overflow-hidden"
        role="tabpanel"
        id={`panel-${activeLeftPanel}`}
        aria-labelledby={`tab-${activeLeftPanel}`}
      >
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
    </>
  );

  return (
    <ErrorBoundary>
      <div 
        className="h-screen flex flex-col bg-background overflow-hidden"
        role="application"
        aria-label="Document Editor"
      >
        {/* Skip Links for Accessibility */}
        <a
          href="#main-canvas"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded"
        >
          Skip to canvas
        </a>

        {/* Toolbar */}
        <header role="banner">
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
        </header>

        {/* Secondary Toolbar */}
        <div 
          className="h-10 bg-muted/30 border-b flex items-center px-2 md:px-4 gap-1 md:gap-2"
          role="toolbar"
          aria-label="Secondary toolbar"
        >
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="w-4 h-4" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="h-full flex flex-col">
                  <LeftPanelContent />
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Panel Toggles for Tablet/Desktop */}
          {!isMobile && (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setLeftPanelOpen(!leftPanelOpen)}
                    aria-label={leftPanelOpen ? 'Hide left panel' : 'Show left panel'}
                    aria-pressed={leftPanelOpen}
                  >
                    <PanelLeftClose className={cn("w-4 h-4", !leftPanelOpen && "rotate-180")} aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{leftPanelOpen ? 'Hide left panel' : 'Show left panel'}</TooltipContent>
              </Tooltip>
            </>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={state.isDrawingMode ? 'default' : 'ghost'}
                size="sm"
                className="h-7 gap-1"
                onClick={toggleDrawingMode}
                aria-label="Toggle drawing mode"
                aria-pressed={state.isDrawingMode}
              >
                <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Draw</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle drawing mode (Ctrl+Shift+D)</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border hidden sm:block" aria-hidden="true" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1"
                onClick={() => setShowDocProperties(true)}
                aria-label="Document properties"
              >
                <Settings className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Properties</span>
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
                aria-label="Export document"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Export document (Ctrl+E)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setShowKeyboardShortcuts(true)}
                aria-label="Keyboard shortcuts"
              >
                <Keyboard className="w-3.5 h-3.5" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Keyboard shortcuts (?)</TooltipContent>
          </Tooltip>

          <div className="flex-1" />

          {/* Right Panel Toggle */}
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setRightPanelOpen(!rightPanelOpen)}
                  aria-label={rightPanelOpen ? 'Hide properties panel' : 'Show properties panel'}
                  aria-pressed={rightPanelOpen}
                >
                  <PanelRightClose className={cn("w-4 h-4", !rightPanelOpen && "rotate-180")} aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{rightPanelOpen ? 'Hide properties' : 'Show properties'}</TooltipContent>
            </Tooltip>
          )}

          <span className="text-xs text-muted-foreground hidden sm:block" aria-live="polite">
            {state.currentTemplate?.elements.length || 0} elements
            {pages.length > 1 && ` • ${pages.length} pages`}
          </span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Templates Sidebar (optional) */}
          {showTemplates && (
            <aside aria-label="Templates sidebar">
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
            </aside>
          )}

          {/* Left Panel - Tabbed Elements/Layers/Pages/Styles */}
          {leftPanelOpen && !isMobile && (
            <aside 
              className="w-48 lg:w-60 border-r border-sidebar-border bg-sidebar flex-shrink-0 flex flex-col"
              aria-label="Editor tools panel"
            >
              <LeftPanelContent />
            </aside>
          )}

          {/* Canvas */}
          <main 
            id="main-canvas"
            className="flex-1 min-w-0"
            role="main"
            aria-label="Document canvas"
          >
            <ErrorBoundary>
              <EditorCanvas
                template={state.currentTemplate}
                selectedElementId={state.selectedElementId}
                zoom={state.zoom}
                showGrid={state.showGrid}
                onSelectElement={selectElement}
                onUpdateElement={updateElement}
              />
            </ErrorBoundary>
          </main>

          {/* Right Panel - Properties */}
          {rightPanelOpen && !isMobile && (
            <aside 
              className="w-56 lg:w-72 border-l border-sidebar-border bg-sidebar flex-shrink-0"
              aria-label="Element properties panel"
            >
              <ErrorBoundary>
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
              </ErrorBoundary>
            </aside>
          )}

          {/* Mobile Properties Sheet */}
          {isMobile && selectedElement && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="fixed bottom-20 right-4 z-40 shadow-lg"
                  aria-label="Edit element properties"
                >
                  <Settings className="w-4 h-4 mr-1" aria-hidden="true" />
                  Edit
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
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
              </SheetContent>
            </Sheet>
          )}
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

        <KeyboardShortcutsDialog
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
      </div>
    </ErrorBoundary>
  );
};

export default Editor;
