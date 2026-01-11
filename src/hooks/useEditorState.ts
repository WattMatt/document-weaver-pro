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
  };
};
