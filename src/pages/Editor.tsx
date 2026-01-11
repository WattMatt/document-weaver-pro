import React, { useState } from 'react';
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
