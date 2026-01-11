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
  barcode: { width: 150, height: 80 },
  icon: { width: 48, height: 48 },
  list: { width: 250, height: 100 },
  'page-number': { width: 100, height: 30 },
  watermark: { width: 300, height: 100 },
  date: { width: 150, height: 30 },
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
  layoutType: 'document',
});

export const useEditorState = () => {
  const [state, setState] = useState<EditorState>({
    currentTemplate: createDefaultTemplate(),
    selectedElementId: null,
    selectedElementIds: [],
    zoom: 100,
    showGrid: true,
    snapToGrid: true,
    gridSize: 20,
    clipboard: [],
    undoStack: [],
    redoStack: [],
  });

  const [templates, setTemplates] = useState<Template[]>([]);

  // ... (previous functions: addToUndoStack, undo, redo, addElement, updateElement, deleteElement, duplicateElement, selectElement, setZoom, toggleGrid, toggleSnapToGrid, updateTemplateName, saveTemplate, loadTemplate)

  // NOTE: I'm skipping re-writing lines 49-226 for brevity, but I must ensure I don't break them. 
  // Actually, replace_file_content requires context.
  // I will just update createNewTemplate and add createNewPresentation.

  // Wait, I need two separate replacements or one large one.
  // Let's first update the `createDefaultTemplate` definition.



  const addToUndoStack = useCallback(() => {
    setState(prev => ({
      ...prev,
      undoStack: [...prev.undoStack, { ...prev, undoStack: [], redoStack: [] }],
      redoStack: [],
    }));
  }, []);

  const undo = useCallback(() => {
    setState(prev => {
      if (prev.undoStack.length === 0) return prev;
      const previousState = prev.undoStack[prev.undoStack.length - 1];
      const newUndoStack = prev.undoStack.slice(0, -1);
      return {
        ...previousState,
        undoStack: newUndoStack,
        redoStack: [...prev.redoStack, { ...prev, undoStack: [], redoStack: [] }],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState(prev => {
      if (prev.redoStack.length === 0) return prev;
      const nextState = prev.redoStack[prev.redoStack.length - 1];
      const newRedoStack = prev.redoStack.slice(0, -1);
      return {
        ...nextState,
        undoStack: [...prev.undoStack, { ...prev, undoStack: [], redoStack: [] }],
        redoStack: newRedoStack,
      };
    });
  }, []);

  const addElement = useCallback((type: ElementType, position?: Position) => {
    addToUndoStack();
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
  }, [addToUndoStack]);

  const updateElement = useCallback((id: string, updates: Partial<DocumentElement>) => {
    addToUndoStack();
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
  }, [addToUndoStack]);

  const deleteElement = useCallback((id: string) => {
    addToUndoStack();
    setState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        elements: prev.currentTemplate.elements.filter(el => el.id !== id),
        updatedAt: new Date(),
      } : null,
      selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
    }));
  }, [addToUndoStack]);

  const duplicateElement = useCallback((id: string) => {
    const element = state.currentTemplate?.elements.find(el => el.id === id);
    if (!element) return;

    addToUndoStack();
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
  }, [state.currentTemplate, addToUndoStack]);

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

  const createNewPresentation = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentTemplate: {
        ...createDefaultTemplate(),
        layoutType: 'presentation',
        pageSize: 'Letter', // Placeholder for 16:9
        orientation: 'landscape',
        slideProperties: {
          backgroundColor: '#ffffff',
          transition: 'none',
        }
      },
      selectedElementId: null,
    }));
  }, []);

  const selectedElement = state.currentTemplate?.elements.find(
    el => el.id === state.selectedElementId
  ) || null;

  const copyStyle = useCallback((id: string) => {
    const element = state.currentTemplate?.elements.find(el => el.id === id);
    if (element) {
      setState(prev => ({
        ...prev,
        copiedStyle: { ...element.style }
      }));
    }
  }, [state.currentTemplate]);

  const pasteStyle = useCallback((id: string) => {
    if (!state.copiedStyle) return;
    updateElement(id, { style: { ...state.copiedStyle } });
  }, [state.copiedStyle, updateElement]);

  const findAndReplace = useCallback((findText: string, replaceText: string) => {
    if (!findText) return;

    setState(prev => {
      if (!prev.currentTemplate) return prev;

      const updatedElements = prev.currentTemplate.elements.map(el => {
        if (el.content && typeof el.content === 'string' && el.content.includes(findText)) {
          return {
            ...el,
            content: el.content.replaceAll(findText, replaceText)
          };
        }
        return el;
      });

      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          elements: updatedElements,
          updatedAt: new Date(),
        }
      };
    });
  }, []);

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
    createNewPresentation,
    undo,
    redo,
    copyStyle,
    pasteStyle,
    findAndReplace,
  };
};
