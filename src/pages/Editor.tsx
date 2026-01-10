import React, { useState } from 'react';
import { useEditorState } from '@/hooks/useEditorState';
import { EditorToolbar } from '@/components/editor/EditorToolbar';
import { ElementsPalette } from '@/components/editor/ElementsPalette';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { EditorCanvas } from '@/components/editor/EditorCanvas';
import { TokensPanel } from '@/components/editor/TokensPanel';
import { PreviewPanel } from '@/components/editor/PreviewPanel';
import { TemplatesSidebar } from '@/components/editor/TemplatesSidebar';
import { ApiIntegrationsPanel } from '@/components/editor/ApiIntegrationsPanel';
import { ElementType } from '@/types/editor';

interface ExternalTemplate {
  id: string;
  name: string;
  description?: string;
  category?: string;
  app: string;
}

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
    generatePublicToken,
    importExternalTemplate,
  } = useEditorState();

  const [showTokens, setShowTokens] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showApiIntegrations, setShowApiIntegrations] = useState(true);

  const handleAddElement = (type: ElementType) => {
    addElement(type);
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
        onUpdateName={updateTemplateName}
        onOpenTokens={() => setShowTokens(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* API Integrations Panel */}
        {showApiIntegrations && (
          <ApiIntegrationsPanel
            onImportTemplate={(template: ExternalTemplate) => importExternalTemplate(template)}
          />
        )}

        {/* Templates Sidebar (optional) */}
        {showTemplates && (
          <TemplatesSidebar
            templates={templates}
            currentTemplateId={state.currentTemplate?.id || null}
            onSelectTemplate={loadTemplate}
            onCreateNew={createNewTemplate}
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
      <TokensPanel
        isOpen={showTokens}
        onClose={() => setShowTokens(false)}
        publicToken={state.currentTemplate?.publicToken}
        integrationTokens={state.currentTemplate?.integrationTokens}
        onGeneratePublicToken={generatePublicToken}
      />

      <PreviewPanel
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        template={state.currentTemplate}
      />
    </div>
  );
};

export default Editor;
