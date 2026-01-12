import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  DocumentElement, 
  Template, 
  EditorState, 
  ElementType, 
  Position, 
  Size,
  Page,
  DocumentProperties,
  DrawingTool,
  DrawingPath,
  ElementStyle,
} from '@/types/editor';
import { toast } from 'sonner';

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
  // Form fields
  'form-text': { width: 200, height: 36 },
  'form-checkbox': { width: 24, height: 24 },
  'form-radio': { width: 24, height: 24 },
  'form-dropdown': { width: 200, height: 36 },
  'form-signature': { width: 250, height: 80 },
  // Annotations
  'annotation-comment': { width: 200, height: 100 },
  'annotation-note': { width: 40, height: 40 },
  'annotation-stamp': { width: 150, height: 50 },
  'annotation-highlight': { width: 200, height: 24 },
  // Drawing
  drawing: { width: 300, height: 200 },
};

const createDefaultPage = (name: string = 'Page 1'): Page => ({
  id: uuidv4(),
  name,
  elements: [],
  backgroundColor: '#ffffff',
  rotation: 0,
});

const createDefaultTemplate = (): Template => {
  const defaultPage = createDefaultPage();
  return {
    id: uuidv4(),
    name: 'Untitled Template',
    description: '',
    elements: [],
    pages: [defaultPage],
    currentPageIndex: 0,
    pageSize: 'A4',
    orientation: 'portrait',
    createdAt: new Date(),
    updatedAt: new Date(),
    layoutType: 'document',
    documentProperties: {
      title: '',
      author: '',
      creator: 'DocBuilder',
      producer: 'DocBuilder PDF Engine',
      creationDate: new Date(),
    },
  };
};

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
    isDrawingMode: false,
    currentDrawingTool: 'pen',
    drawingColor: '#000000',
    drawingWidth: 2,
    activePanel: 'elements',
  });

  const [templates, setTemplates] = useState<Template[]>([]);
  const [drawingPaths, setDrawingPaths] = useState<DrawingPath[]>([]);

  // Get current page
  const currentPage = state.currentTemplate?.pages?.[state.currentTemplate?.currentPageIndex || 0];

  const addToUndoStack = useCallback(() => {
    setState(prev => ({
      ...prev,
      undoStack: [...prev.undoStack.slice(-19), { ...prev, undoStack: [], redoStack: [] }],
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
      content: getDefaultContent(type),
      tableData: type === 'table' ? {
        rows: 3,
        cols: 3,
        cells: Array(3).fill(null).map(() =>
          Array(3).fill(null).map(() => ({ content: '', style: {} }))
        ),
      } : undefined,
      shapeType: type === 'shape' ? 'rectangle' : undefined,
      shapeFilled: true,
      visible: true,
      locked: false,
      formField: type.startsWith('form-') ? {
        fieldType: 'text',
        placeholder: 'Enter value...',
        required: false,
      } : undefined,
      annotation: type.startsWith('annotation-') ? {
        author: 'User',
        createdAt: new Date(),
        status: 'open',
        stampType: type === 'annotation-stamp' ? 'approved' : undefined,
      } : undefined,
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

  // Layer reordering
  const reorderElement = useCallback((id: string, direction: 'up' | 'down') => {
    addToUndoStack();
    setState(prev => {
      if (!prev.currentTemplate) return prev;
      
      const elements = [...prev.currentTemplate.elements];
      const index = elements.findIndex(el => el.id === id);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index + 1 : index - 1;
      if (newIndex < 0 || newIndex >= elements.length) return prev;

      [elements[index], elements[newIndex]] = [elements[newIndex], elements[index]];

      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          elements,
          updatedAt: new Date(),
        },
      };
    });
  }, [addToUndoStack]);

  // Bring to front / send to back
  const bringToFront = useCallback((id: string) => {
    addToUndoStack();
    setState(prev => {
      if (!prev.currentTemplate) return prev;
      
      const element = prev.currentTemplate.elements.find(el => el.id === id);
      if (!element) return prev;

      const otherElements = prev.currentTemplate.elements.filter(el => el.id !== id);
      
      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          elements: [...otherElements, element],
          updatedAt: new Date(),
        },
      };
    });
  }, [addToUndoStack]);

  const sendToBack = useCallback((id: string) => {
    addToUndoStack();
    setState(prev => {
      if (!prev.currentTemplate) return prev;
      
      const element = prev.currentTemplate.elements.find(el => el.id === id);
      if (!element) return prev;

      const otherElements = prev.currentTemplate.elements.filter(el => el.id !== id);
      
      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          elements: [element, ...otherElements],
          updatedAt: new Date(),
        },
      };
    });
  }, [addToUndoStack]);

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
    toast.success('Template saved successfully');
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
        pageSize: 'Letter',
        orientation: 'landscape',
        slideProperties: {
          backgroundColor: '#ffffff',
          transition: 'none',
        }
      },
      selectedElementId: null,
    }));
  }, []);

  // Page management
  const addPage = useCallback(() => {
    addToUndoStack();
    setState(prev => {
      if (!prev.currentTemplate) return prev;
      
      const pageCount = prev.currentTemplate.pages?.length || 0;
      const newPage = createDefaultPage(`Page ${pageCount + 1}`);
      
      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          pages: [...(prev.currentTemplate.pages || []), newPage],
          currentPageIndex: pageCount,
          updatedAt: new Date(),
        },
      };
    });
    toast.success('Page added');
  }, [addToUndoStack]);

  const deletePage = useCallback((pageId: string) => {
    addToUndoStack();
    setState(prev => {
      if (!prev.currentTemplate || !prev.currentTemplate.pages) return prev;
      if (prev.currentTemplate.pages.length <= 1) {
        toast.error('Cannot delete the last page');
        return prev;
      }

      const pageIndex = prev.currentTemplate.pages.findIndex(p => p.id === pageId);
      const newPages = prev.currentTemplate.pages.filter(p => p.id !== pageId);
      const newCurrentIndex = Math.min(prev.currentTemplate.currentPageIndex || 0, newPages.length - 1);
      
      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          pages: newPages,
          currentPageIndex: newCurrentIndex,
          updatedAt: new Date(),
        },
      };
    });
  }, [addToUndoStack]);

  const duplicatePage = useCallback((pageId: string) => {
    addToUndoStack();
    setState(prev => {
      if (!prev.currentTemplate || !prev.currentTemplate.pages) return prev;
      
      const page = prev.currentTemplate.pages.find(p => p.id === pageId);
      if (!page) return prev;

      const pageIndex = prev.currentTemplate.pages.findIndex(p => p.id === pageId);
      const newPage: Page = {
        ...page,
        id: uuidv4(),
        name: `${page.name} (Copy)`,
        elements: page.elements.map(el => ({ ...el, id: uuidv4() })),
      };

      const newPages = [
        ...prev.currentTemplate.pages.slice(0, pageIndex + 1),
        newPage,
        ...prev.currentTemplate.pages.slice(pageIndex + 1),
      ];
      
      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          pages: newPages,
          currentPageIndex: pageIndex + 1,
          updatedAt: new Date(),
        },
      };
    });
    toast.success('Page duplicated');
  }, [addToUndoStack]);

  const reorderPage = useCallback((pageId: string, direction: 'up' | 'down') => {
    addToUndoStack();
    setState(prev => {
      if (!prev.currentTemplate || !prev.currentTemplate.pages) return prev;
      
      const pages = [...prev.currentTemplate.pages];
      const index = pages.findIndex(p => p.id === pageId);
      if (index === -1) return prev;

      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= pages.length) return prev;

      [pages[index], pages[newIndex]] = [pages[newIndex], pages[index]];

      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          pages,
          currentPageIndex: newIndex,
          updatedAt: new Date(),
        },
      };
    });
  }, [addToUndoStack]);

  const renamePage = useCallback((pageId: string, name: string) => {
    setState(prev => {
      if (!prev.currentTemplate || !prev.currentTemplate.pages) return prev;
      
      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          pages: prev.currentTemplate.pages.map(p =>
            p.id === pageId ? { ...p, name } : p
          ),
          updatedAt: new Date(),
        },
      };
    });
  }, []);

  const rotatePage = useCallback((pageId: string) => {
    addToUndoStack();
    setState(prev => {
      if (!prev.currentTemplate || !prev.currentTemplate.pages) return prev;
      
      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          pages: prev.currentTemplate.pages.map(p => {
            if (p.id !== pageId) return p;
            const rotations: (0 | 90 | 180 | 270)[] = [0, 90, 180, 270];
            const currentIndex = rotations.indexOf(p.rotation || 0);
            const nextRotation = rotations[(currentIndex + 1) % 4];
            return { ...p, rotation: nextRotation };
          }),
          updatedAt: new Date(),
        },
      };
    });
  }, [addToUndoStack]);

  const selectPage = useCallback((pageId: string) => {
    setState(prev => {
      if (!prev.currentTemplate || !prev.currentTemplate.pages) return prev;
      
      const pageIndex = prev.currentTemplate.pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return prev;

      return {
        ...prev,
        currentTemplate: {
          ...prev.currentTemplate,
          currentPageIndex: pageIndex,
        },
        selectedElementId: null,
      };
    });
  }, []);

  // Drawing mode
  const toggleDrawingMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isDrawingMode: !prev.isDrawingMode,
      selectedElementId: null,
    }));
  }, []);

  const setDrawingTool = useCallback((tool: DrawingTool) => {
    setState(prev => ({ ...prev, currentDrawingTool: tool }));
  }, []);

  const setDrawingColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, drawingColor: color }));
  }, []);

  const setDrawingWidth = useCallback((width: number) => {
    setState(prev => ({ ...prev, drawingWidth: width }));
  }, []);

  const clearDrawings = useCallback(() => {
    setDrawingPaths([]);
  }, []);

  // Document properties
  const updateDocumentProperties = useCallback((properties: DocumentProperties) => {
    setState(prev => ({
      ...prev,
      currentTemplate: prev.currentTemplate ? {
        ...prev.currentTemplate,
        documentProperties: properties,
        updatedAt: new Date(),
      } : null,
    }));
  }, []);

  // Active panel
  const setActivePanel = useCallback((panel: EditorState['activePanel']) => {
    setState(prev => ({ ...prev, activePanel: panel }));
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
      toast.success('Style copied');
    }
  }, [state.currentTemplate]);

  const pasteStyle = useCallback((id: string) => {
    if (!state.copiedStyle) {
      toast.error('No style to paste');
      return;
    }
    updateElement(id, { style: { ...state.copiedStyle } });
    toast.success('Style applied');
  }, [state.copiedStyle, updateElement]);

  const applyStylePreset = useCallback((style: Partial<ElementStyle>) => {
    if (!state.selectedElementId) return;
    
    const element = state.currentTemplate?.elements.find(el => el.id === state.selectedElementId);
    if (!element) return;

    updateElement(state.selectedElementId, {
      style: { ...element.style, ...style }
    });
    toast.success('Preset applied');
  }, [state.selectedElementId, state.currentTemplate, updateElement]);

  const findAndReplace = useCallback((findText: string, replaceText: string) => {
    if (!findText) return;

    let replacements = 0;
    setState(prev => {
      if (!prev.currentTemplate) return prev;

      const updatedElements = prev.currentTemplate.elements.map(el => {
        if (el.content && typeof el.content === 'string' && el.content.includes(findText)) {
          replacements++;
          return {
            ...el,
            content: el.content.split(findText).join(replaceText)
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

    toast.success(`Replaced ${replacements} occurrence(s)`);
  }, []);

  return {
    state,
    templates,
    selectedElement,
    currentPage,
    drawingPaths,
    setDrawingPaths,
    // Element operations
    addElement,
    updateElement,
    deleteElement,
    duplicateElement,
    selectElement,
    reorderElement,
    bringToFront,
    sendToBack,
    // View controls
    setZoom,
    toggleGrid,
    toggleSnapToGrid,
    // Template operations
    updateTemplateName,
    saveTemplate,
    loadTemplate,
    createNewTemplate,
    createNewPresentation,
    // Page operations
    addPage,
    deletePage,
    duplicatePage,
    reorderPage,
    renamePage,
    rotatePage,
    selectPage,
    // Drawing
    toggleDrawingMode,
    setDrawingTool,
    setDrawingColor,
    setDrawingWidth,
    clearDrawings,
    // Document properties
    updateDocumentProperties,
    // Panel
    setActivePanel,
    // Style operations
    copyStyle,
    pasteStyle,
    applyStylePreset,
    // History
    undo,
    redo,
    findAndReplace,
  };
};

// Helper function for default content
function getDefaultContent(type: ElementType): string {
  switch (type) {
    case 'text': return 'Enter text here...';
    case 'header': return 'Header Title';
    case 'footer': return 'Footer text';
    case 'dynamic-field': return '{{field_name}}';
    case 'form-text': return '';
    case 'form-checkbox': return 'Checkbox option';
    case 'form-radio': return 'Radio option';
    case 'form-dropdown': return 'Select an option';
    case 'annotation-comment': return 'Add your comment here...';
    case 'annotation-note': return '';
    case 'annotation-stamp': return 'APPROVED';
    case 'annotation-highlight': return '';
    default: return '';
  }
}
