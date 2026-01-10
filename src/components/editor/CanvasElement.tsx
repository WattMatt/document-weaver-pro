import React, { useState, useRef, useEffect } from 'react';
import { DocumentElement } from '@/types/editor';
import { cn } from '@/lib/utils';

interface CanvasElementProps {
  element: DocumentElement;
  isSelected: boolean;
  zoom: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<DocumentElement>) => void;
}

export const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  isSelected,
  zoom,
  onSelect,
  onUpdate,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0, elementX: 0, elementY: 0 });

  const scale = zoom / 100;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (element.locked || isEditing) return;
    e.stopPropagation();
    onSelect();
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: element.position.x,
      elementY: element.position.y,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    if (element.locked) return;
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: element.size.width,
      height: element.size.height,
      elementX: element.position.x,
      elementY: element.position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const dx = (e.clientX - dragStart.current.x) / scale;
        const dy = (e.clientY - dragStart.current.y) / scale;
        onUpdate({
          position: {
            x: dragStart.current.elementX + dx,
            y: dragStart.current.elementY + dy,
          },
        });
      }
      if (isResizing && resizeHandle) {
        const dx = (e.clientX - resizeStart.current.x) / scale;
        const dy = (e.clientY - resizeStart.current.y) / scale;
        
        let newWidth = resizeStart.current.width;
        let newHeight = resizeStart.current.height;
        let newX = resizeStart.current.elementX;
        let newY = resizeStart.current.elementY;

        if (resizeHandle.includes('e')) newWidth = Math.max(50, resizeStart.current.width + dx);
        if (resizeHandle.includes('w')) {
          newWidth = Math.max(50, resizeStart.current.width - dx);
          newX = resizeStart.current.elementX + (resizeStart.current.width - newWidth);
        }
        if (resizeHandle.includes('s')) newHeight = Math.max(20, resizeStart.current.height + dy);
        if (resizeHandle.includes('n')) {
          newHeight = Math.max(20, resizeStart.current.height - dy);
          newY = resizeStart.current.elementY + (resizeStart.current.height - newHeight);
        }

        onUpdate({
          position: { x: newX, y: newY },
          size: { width: newWidth, height: newHeight },
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeHandle(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, resizeHandle, scale, onUpdate]);

  const handleDoubleClick = () => {
    if (['text', 'header', 'footer', 'dynamic-field'].includes(element.type)) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const renderContent = () => {
    const style = element.style || {};
    const contentStyle: React.CSSProperties = {
      fontSize: style.fontSize,
      fontWeight: style.fontWeight as any,
      color: style.color,
      textAlign: style.textAlign,
      width: '100%',
      height: '100%',
    };

    switch (element.type) {
      case 'text':
      case 'header':
      case 'footer':
      case 'dynamic-field':
        if (isEditing) {
          return (
            <textarea
              value={element.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onBlur={handleBlur}
              autoFocus
              className="w-full h-full resize-none bg-transparent border-none outline-none p-2"
              style={contentStyle}
            />
          );
        }
        return (
          <div className="p-2 overflow-hidden" style={contentStyle}>
            {element.type === 'dynamic-field' ? (
              <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs font-mono">
                {element.content || `{{${element.dynamicField || 'field'}}}`}
              </span>
            ) : (
              element.content
            )}
          </div>
        );

      case 'image':
        return (
          <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded">
            {element.imageUrl ? (
              <img src={element.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="text-muted-foreground text-xs">Drop image or click to upload</div>
            )}
          </div>
        );

      case 'table':
        const { rows = 3, cols = 3, cells = [] } = element.tableData || { rows: 3, cols: 3, cells: [] };
        return (
          <table className="w-full h-full border-collapse text-xs">
            <tbody>
              {Array(rows).fill(null).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array(cols).fill(null).map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className="border border-border p-1"
                      style={contentStyle}
                    >
                      {cells[rowIndex]?.[colIndex]?.content || ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'shape':
        const shapeStyle: React.CSSProperties = {
          backgroundColor: style.backgroundColor,
          borderRadius: element.shapeType === 'circle' ? '50%' : style.borderRadius,
        };
        if (element.shapeType === 'line') {
          return (
            <div className="w-full h-0.5 bg-current" style={{ backgroundColor: style.color }} />
          );
        }
        return <div className="w-full h-full" style={shapeStyle} />;

      case 'divider':
        return <div className="w-full h-0.5 bg-border" />;

      case 'signature':
        return (
          <div className="w-full h-full border-b-2 border-dashed border-muted-foreground/30 flex items-end justify-center pb-2">
            <span className="text-xs text-muted-foreground">Signature</span>
          </div>
        );

      default:
        return null;
    }
  };

  if (element.visible === false) return null;

  // Defensive checks for required properties
  if (!element.position || !element.size) {
    console.warn('CanvasElement: Missing position or size for element', element.id);
    return null;
  }

  return (
    <div
      ref={elementRef}
      className={cn(
        "absolute cursor-move transition-shadow",
        isSelected && "element-selected",
        element.locked && "cursor-not-allowed opacity-75"
      )}
      style={{
        left: element.position?.x ?? 0,
        top: element.position?.y ?? 0,
        width: element.size?.width ?? 100,
        height: element.size?.height ?? 50,
        backgroundColor: element.style?.backgroundColor !== 'transparent' ? element.style?.backgroundColor : undefined,
        borderRadius: element.style?.borderRadius,
        opacity: element.style?.opacity,
        padding: element.style?.padding,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {renderContent()}

      {/* Resize Handles */}
      {isSelected && !element.locked && (
        <>
          <div
            className="element-handle absolute -top-1 -left-1 cursor-nw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className="element-handle absolute -top-1 left-1/2 -translate-x-1/2 cursor-n-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className="element-handle absolute -top-1 -right-1 cursor-ne-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className="element-handle absolute top-1/2 -right-1 -translate-y-1/2 cursor-e-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
          <div
            className="element-handle absolute -bottom-1 -right-1 cursor-se-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
          <div
            className="element-handle absolute -bottom-1 left-1/2 -translate-x-1/2 cursor-s-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className="element-handle absolute -bottom-1 -left-1 cursor-sw-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className="element-handle absolute top-1/2 -left-1 -translate-y-1/2 cursor-w-resize"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
        </>
      )}
    </div>
  );
};
