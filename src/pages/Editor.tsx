import React, { useState, useEffect, useCallback } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { ElementsPalette } from '@/components/editor/ElementsPalette';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { PreviewPanel } from '@/components/editor/PreviewPanel';
import { TemplatesSidebar } from '@/components/editor/TemplatesSidebar';
import { ElementType } from '@/types/editor';
import { PptxExportService } from '@/services/pptx/PptxExportService';
import { toast } from 'sonner';

const Editor: React.FC = () => {
  const {
    state,
    templates,
    selectedElement,
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    selectElement,
    setZoom,
    toggleGrid,
    toggleSnapToGrid,
    updateTemplateName,
    saveTemplate,
    loadTemplate,
    createNewTemplate,
    createNewPresentation,
    undo,
    redo,
    copyStyle,
    pasteStyle,
    findAndReplace,
  } = useEditorState();

  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Keyboard shortcuts handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Ignore if user is typing in an input or textarea
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

    // Escape - Deselect
    if (e.key === 'Escape') {
      selectElement(null);
      return;
    }
  }, [state.selectedElementId, undo, redo, duplicateElement, deleteElement, saveTemplate, selectElement]);

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

        {/* Left Panel - Elements Palette */}
        <div className="w-56 border-r border-sidebar-border bg-sidebar flex-shrink-0">
          <ElementsPalette onAddElement={handleAddElement} />
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
          />
        </div>
      </div>

      {/* Modals */}
      <PreviewPanel
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        template={state.currentTemplate}
      />
    </div>
  );
};

export default Editor;
