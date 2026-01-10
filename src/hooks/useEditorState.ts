import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { DocumentElement, Template, EditorState, ElementType, Position, Size } from '@/types/editor';

const defaultElementSizes: Record<ElementType, Size> = {
  text: { width: 200, height: 40 },
  image: { width: 200, height: 150 },
  table: { width: 400, height: 150 },
  shape: { width: 100, height: 100 },
  divider: { width: 500, height: 2 },
  header: { width: 500, height: 60 },
  footer: { width: 500, height: 40 },
  signature: { width: 200, height: 80 },
  'dynamic-field': { width: 150, height: 30 },
};

const createDefaultTemplate = (): Template => ({
  id: uuidv4(),
  name: 'Untitled Template',
  description: '',
  elements: [],
  pageSize: 'A4',
  orientation: 'portrait',
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const useEditorState = () => {
  const [state, setState] = useState<EditorState>({
    currentTemplate: createDefaultTemplate(),
    selectedElementId: null,
    zoom: 100,
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
  });

  const [templates, setTemplates] = useState<Template[]>([]);

  const addElement = useCallback((type: ElementType, position?: Position) => {
    const newElement: DocumentElement = {
      id: uuidv4(),
      type,
      position: position || { x: 100, y: 100 },
      size: { ...defaultElementSizes[type] },
      style: {
        fontSize: type === 'header' ? 24 : 14,
        fontWeight: type === 'header' ? 'bold' : 'normal',
        color: '#1a1a1a',
        backgroundColor: type === 'shape' ? '#e5e7eb' : 'transparent',
        textAlign: 'left',
        padding: 8,
      },
      content: type === 'text' ? 'Enter text here...' : 
               type === 'header' ? 'Header Title' :
               type === 'footer' ? 'Footer text' :
               type === 'dynamic-field' ? '{{field_name}}' : '',
      tableData: type === 'table' ? {
        rows: 3,
        cols: 3,
        cells: Array(3).fill(null).map(() => 
          Array(3).fill(null).map(() => ({ content: '', style: {} }))
        ),
      } : undefined,
      shapeType: type === 'shape' ? 'rectangle' : undefined,
      visible: true,
      locked: false,
    };

    setState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        elements: [...prev.currentTemplate.elements, newElement],
        updatedAt: new Date(),
      } : null,
      selectedElementId: newElement.id,
    }));

    return newElement;
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<DocumentElement>) => {
    setState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        elements: prev.currentTemplate.elements.map(el =>
          el.id === id ? { ...el, ...updates } : el
        ),
        updatedAt: new Date(),
      } : null,
    }));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        elements: prev.currentTemplate.elements.filter(el => el.id !== id),
        updatedAt: new Date(),
      } : null,
      selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
    }));
  }, []);

  const duplicateElement = useCallback((id: string) => {
    const element = state.currentTemplate?.elements.find(el => el.id === id);
    if (!element) return;

    const newElement: DocumentElement = {
      ...element,
      id: uuidv4(),
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20,
      },
    };

    setState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        elements: [...prev.currentTemplate.elements, newElement],
        updatedAt: new Date(),
      } : null,
      selectedElementId: newElement.id,
    }));
  }, [state.currentTemplate]);

  const selectElement = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, selectedElementId: id }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState(prev => ({ ...prev, zoom: Math.max(25, Math.min(200, zoom)) }));
  }, []);

  const toggleGrid = useCallback(() => {
    setState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const toggleSnapToGrid = useCallback(() => {
    setState(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  }, []);

  const updateTemplateName = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        name,
        updatedAt: new Date(),
      } : null,
    }));
  }, []);

  const saveTemplate = useCallback(() => {
    if (!state.currentTemplate) return;
    
    setTemplates(prev => {
      const existing = prev.findIndex(t => t.id === state.currentTemplate!.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = state.currentTemplate!;
        return updated;
      }
      return [...prev, state.currentTemplate!];
    });
  }, [state.currentTemplate]);

  const loadTemplate = useCallback((template: Template) => {
    setState(prev => ({
      ...prev,
      currentTemplate: template,
      selectedElementId: null,
    }));
  }, []);

  const createNewTemplate = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTemplate: createDefaultTemplate(),
      selectedElementId: null,
    }));
  }, []);

  const generatePublicToken = useCallback(() => {
    const token = `pub_${uuidv4().replace(/-/g, '')}`;
    setState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        publicToken: token,
        updatedAt: new Date(),
      } : null,
    }));
    return token;
  }, []);

  const importExternalTemplate = useCallback((externalTemplate: { 
    id: string; 
    name: string; 
    description?: string;
    category?: string;
    app: string;
    elements?: DocumentElement[];
  }) => {
    // Generate starter elements based on template category
    const starterElements: DocumentElement[] = [];
    const category = externalTemplate.category?.toLowerCase() || 'template';

    // Header element
    starterElements.push({
      id: uuidv4(),
      type: 'header',
      position: { x: 50, y: 30 },
      size: { width: 500, height: 60 },
      style: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        backgroundColor: 'transparent',
        textAlign: 'center',
        padding: 8,
      },
      content: externalTemplate.name,
      visible: true,
      locked: false,
    });

    // Description text
    if (externalTemplate.description) {
      starterElements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: 50, y: 100 },
        size: { width: 500, height: 40 },
        style: {
          fontSize: 12,
          fontWeight: 'normal',
          color: '#6b7280',
          backgroundColor: 'transparent',
          textAlign: 'center',
          padding: 8,
        },
        content: externalTemplate.description,
        visible: true,
        locked: false,
      });
    }

    // Category badge
    starterElements.push({
      id: uuidv4(),
      type: 'text',
      position: { x: 50, y: 150 },
      size: { width: 120, height: 28 },
      style: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#6366f1',
        backgroundColor: '#eef2ff',
        textAlign: 'center',
        padding: 6,
        borderRadius: 4,
      },
      content: externalTemplate.category || 'Template',
      visible: true,
      locked: false,
    });

    // Divider
    starterElements.push({
      id: uuidv4(),
      type: 'divider',
      position: { x: 50, y: 190 },
      size: { width: 500, height: 2 },
      style: {
        backgroundColor: '#e5e7eb',
        padding: 0,
      },
      content: '',
      visible: true,
      locked: false,
    });

    // Category-specific content area
    if (category.includes('compliance') || category.includes('report')) {
      // Add table for compliance reports
      starterElements.push({
        id: uuidv4(),
        type: 'table',
        position: { x: 50, y: 220 },
        size: { width: 500, height: 200 },
        style: {
          fontSize: 12,
          color: '#1a1a1a',
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          padding: 8,
        },
        content: '',
        tableData: {
          rows: 5,
          cols: 4,
          cells: [
            [{ content: 'Item', style: { fontWeight: 'bold' } }, { content: 'Status', style: { fontWeight: 'bold' } }, { content: 'Date', style: { fontWeight: 'bold' } }, { content: 'Notes', style: { fontWeight: 'bold' } }],
            [{ content: '', style: {} }, { content: '', style: {} }, { content: '', style: {} }, { content: '', style: {} }],
            [{ content: '', style: {} }, { content: '', style: {} }, { content: '', style: {} }, { content: '', style: {} }],
            [{ content: '', style: {} }, { content: '', style: {} }, { content: '', style: {} }, { content: '', style: {} }],
            [{ content: '', style: {} }, { content: '', style: {} }, { content: '', style: {} }, { content: '', style: {} }],
          ],
        },
        visible: true,
        locked: false,
      });
    } else if (category.includes('audit') || category.includes('checklist')) {
      // Add checklist-style content
      starterElements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: 50, y: 220 },
        size: { width: 500, height: 30 },
        style: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#1a1a1a',
          backgroundColor: 'transparent',
          textAlign: 'left',
          padding: 8,
        },
        content: 'Checklist Items:',
        visible: true,
        locked: false,
      });
      
      // Checklist items
      ['☐ Item 1', '☐ Item 2', '☐ Item 3', '☐ Item 4'].forEach((item, index) => {
        starterElements.push({
          id: uuidv4(),
          type: 'text',
          position: { x: 50, y: 260 + (index * 35) },
          size: { width: 500, height: 30 },
          style: {
            fontSize: 13,
            fontWeight: 'normal',
            color: '#374151',
            backgroundColor: index % 2 === 0 ? '#f9fafb' : 'transparent',
            textAlign: 'left',
            padding: 8,
          },
          content: item,
          visible: true,
          locked: false,
        });
      });
    } else if (category.includes('incident')) {
      // Incident report form fields
      const fields = ['Date of Incident:', 'Location:', 'Description:', 'Reported By:', 'Action Taken:'];
      fields.forEach((field, index) => {
        starterElements.push({
          id: uuidv4(),
          type: 'dynamic-field',
          position: { x: 50, y: 220 + (index * 50) },
          size: { width: 500, height: 40 },
          style: {
            fontSize: 13,
            fontWeight: 'normal',
            color: '#1a1a1a',
            backgroundColor: '#f9fafb',
            textAlign: 'left',
            padding: 10,
            borderColor: '#e5e7eb',
            borderWidth: 1,
          },
          content: `{{${field.replace(':', '').toLowerCase().replace(/ /g, '_')}}}`,
          dynamicField: field.replace(':', '').toLowerCase().replace(/ /g, '_'),
          visible: true,
          locked: false,
        });
        
        // Label for the field
        starterElements.push({
          id: uuidv4(),
          type: 'text',
          position: { x: 50, y: 200 + (index * 50) },
          size: { width: 150, height: 20 },
          style: {
            fontSize: 11,
            fontWeight: 'bold',
            color: '#6b7280',
            backgroundColor: 'transparent',
            textAlign: 'left',
            padding: 2,
          },
          content: field,
          visible: true,
          locked: false,
        });
      });
    } else {
      // Generic content placeholder
      starterElements.push({
        id: uuidv4(),
        type: 'text',
        position: { x: 50, y: 220 },
        size: { width: 500, height: 200 },
        style: {
          fontSize: 14,
          fontWeight: 'normal',
          color: '#374151',
          backgroundColor: '#f9fafb',
          textAlign: 'left',
          padding: 16,
        },
        content: 'Add your content here. This template was imported from ' + externalTemplate.app + '.\n\nYou can customize it by adding text, tables, images, and other elements from the palette.',
        visible: true,
        locked: false,
      });
    }

    // Signature area for formal documents
    if (category.includes('compliance') || category.includes('audit') || category.includes('report')) {
      starterElements.push({
        id: uuidv4(),
        type: 'signature',
        position: { x: 50, y: 700 },
        size: { width: 200, height: 80 },
        style: {
          fontSize: 12,
          color: '#1a1a1a',
          backgroundColor: 'transparent',
          borderColor: '#d1d5db',
          borderWidth: 1,
          padding: 8,
        },
        content: 'Signature',
        visible: true,
        locked: false,
      });
    }

    // Footer
    starterElements.push({
      id: uuidv4(),
      type: 'footer',
      position: { x: 50, y: 800 },
      size: { width: 500, height: 40 },
      style: {
        fontSize: 10,
        fontWeight: 'normal',
        color: '#9ca3af',
        backgroundColor: 'transparent',
        textAlign: 'center',
        padding: 8,
      },
      content: `Imported from ${externalTemplate.app} • ${new Date().toLocaleDateString()}`,
      visible: true,
      locked: false,
    });

    // Use provided elements or starter elements
    const elements = externalTemplate.elements && externalTemplate.elements.length > 0 
      ? externalTemplate.elements 
      : starterElements;

    const newTemplate: Template = {
      id: uuidv4(),
      name: `${externalTemplate.name} (Imported)`,
      description: externalTemplate.description || `Imported from ${externalTemplate.app}`,
      elements,
      pageSize: 'A4',
      orientation: 'portrait',
      createdAt: new Date(),
      updatedAt: new Date(),
      sourceApp: externalTemplate.app,
      sourceTemplateId: externalTemplate.id,
    };

    setState(prev => ({
      ...prev,
      currentTemplate: newTemplate,
      selectedElementId: null,
    }));

    // Also add to templates list
    setTemplates(prev => [...prev, newTemplate]);

    return newTemplate;
  }, []);

  const selectedElement = state.currentTemplate?.elements.find(
    el => el.id === state.selectedElementId
  ) || null;

  return {
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
  };
};
