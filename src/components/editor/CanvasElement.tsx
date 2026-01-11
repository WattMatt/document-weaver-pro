import React, { useState, useRef, useEffect } from 'react';
import { DocumentElement, ImageFilters, BoxShadow, ShapeType, Gradient } from '@/types/editor';
import { cn } from '@/lib/utils';
import {
  Star,
  Circle,
  Square,
  Triangle,
  Hexagon,
  Pentagon,
  Diamond,
  ArrowRight,
  QrCode
} from 'lucide-react';

interface CanvasElementProps {
  element: DocumentElement;
  isSelected: boolean;
  zoom: number;
  onSelect: () => void;
  onUpdate: (updates: Partial<DocumentElement>) => void;
}

// Generate CSS gradient string
const getGradientString = (gradient?: Gradient): string => {
  if (!gradient) return 'none';
  const stopsString = gradient.stops
    .sort((a, b) => a.offset - b.offset)
    .map(stop => `${stop.color} ${stop.offset}%`)
    .join(', ');

  if (gradient.type === 'radial') {
    return `radial-gradient(circle, ${stopsString})`;
  }
  return `linear-gradient(${gradient.angle || 90}deg, ${stopsString})`;
};

// Generate CSS filter string from ImageFilters
const getFilterString = (filters?: ImageFilters): string => {
  if (!filters) return 'none';
  const parts: string[] = [];
  if (filters.brightness !== 100) parts.push(`brightness(${filters.brightness}%)`);
  if (filters.contrast !== 100) parts.push(`contrast(${filters.contrast}%)`);
  if (filters.saturation !== 100) parts.push(`saturate(${filters.saturation}%)`);
  if (filters.blur > 0) parts.push(`blur(${filters.blur}px)`);
  if (filters.grayscale > 0) parts.push(`grayscale(${filters.grayscale}%)`);
  if (filters.sepia > 0) parts.push(`sepia(${filters.sepia}%)`);
  if (filters.hueRotate !== 0) parts.push(`hue-rotate(${filters.hueRotate}deg)`);
  return parts.length > 0 ? parts.join(' ') : 'none';
};

// Generate CSS box-shadow string
const getBoxShadowString = (shadow?: BoxShadow): string => {
  if (!shadow?.enabled) return 'none';
  return `${shadow.offsetX}px ${shadow.offsetY}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
};

// Generate SVG path for shapes
const getShapePath = (type: ShapeType, width: number, height: number): string => {
  const cx = width / 2;
  const cy = height / 2;

  switch (type) {
    case 'triangle':
      return `M${cx},0 L${width},${height} L0,${height} Z`;
    case 'diamond':
      return `M${cx},0 L${width},${cy} L${cx},${height} L0,${cy} Z`;
    case 'pentagon':
      const p = 5;
      const pPoints = Array.from({ length: p }, (_, i) => {
        const angle = (i * 2 * Math.PI) / p - Math.PI / 2;
        return `${cx + cx * Math.cos(angle)},${cy + cy * Math.sin(angle)}`;
      });
      return `M${pPoints.join(' L')} Z`;
    case 'hexagon':
      const h = 6;
      const hPoints = Array.from({ length: h }, (_, i) => {
        const angle = (i * 2 * Math.PI) / h - Math.PI / 2;
        return `${cx + cx * Math.cos(angle)},${cy + cy * Math.sin(angle)}`;
      });
      return `M${hPoints.join(' L')} Z`;
    case 'star':
      const outerRadius = Math.min(cx, cy);
      const innerRadius = outerRadius * 0.4;
      const starPoints: string[] = [];
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        starPoints.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
      }
      return `M${starPoints.join(' L')} Z`;
    case 'arrow':
      const arrowWidth = width * 0.6;
      const arrowHead = width * 0.4;
      const arrowHeight = height * 0.3;
      return `M0,${cy - arrowHeight} L${arrowWidth},${cy - arrowHeight} L${arrowWidth},0 L${width},${cy} L${arrowWidth},${height} L${arrowWidth},${cy + arrowHeight} L0,${cy + arrowHeight} Z`;
    default:
      return '';
  }
};

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
    if (['text', 'header', 'footer', 'dynamic-field', 'page-number', 'watermark'].includes(element.type)) {
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
      fontFamily: style.fontFamily,
      fontStyle: style.fontStyle,
      color: style.color,
      textAlign: style.textAlign,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
      textDecoration: style.textDecoration,
      textTransform: style.textTransform as any,
      width: '100%',
      height: '100%',
    };

    switch (element.type) {
      case 'text':
      case 'header':
      case 'footer':
      case 'dynamic-field':
      case 'page-number':
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
          <div className="p-2 overflow-hidden whitespace-pre-wrap" style={contentStyle}>
            {element.type === 'dynamic-field' ? (
              <span className="text-primary bg-primary/10 px-2 py-0.5 rounded text-xs font-mono">
                {element.content || `{{${element.dynamicField || 'field'}}}`}
              </span>
            ) : element.type === 'page-number' ? (
              <span className="text-muted-foreground font-mono text-xs">
                {element.content || 'Page {{page}}'}
              </span>
            ) : (
              element.content
            )}
          </div>
        );

      case 'watermark':
        if (isEditing) {
          return (
            <textarea
              value={element.content || ''}
              onChange={(e) => onUpdate({ content: e.target.value })}
              onBlur={handleBlur}
              autoFocus
              className="w-full h-full resize-none bg-transparent border-none outline-none p-2 text-center"
              style={{ ...contentStyle, opacity: element.watermarkOpacity || 0.1 }}
            />
          );
        }
        return (
          <div
            className="p-2 overflow-hidden flex items-center justify-center"
            style={{
              ...contentStyle,
              opacity: element.watermarkOpacity || 0.1,
              transform: `rotate(-${element.rotation || 30}deg)`,
            }}
          >
            {element.watermarkPattern === 'tiled' ? (
              <div className="grid grid-cols-2 gap-4 text-center">
                {[...Array(4)].map((_, i) => (
                  <span key={i}>{element.content || 'WATERMARK'}</span>
                ))}
              </div>
            ) : (
              element.content || 'WATERMARK'
            )}
          </div>
        );

      case 'list':
        const ListTag = element.listType === 'numbered' ? 'ol' : 'ul';
        const listItems = element.listItems || ['Item 1', 'Item 2', 'Item 3'];
        return (
          <div className="p-2 overflow-hidden" style={contentStyle}>
            <ListTag className={cn(
              "pl-5 space-y-1",
              element.listType === 'bullet' && "list-disc",
              element.listType === 'numbered' && "list-decimal",
              element.listType === 'none' && "list-none pl-0"
            )}>
              {listItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ListTag>
          </div>
        );

      case 'icon':
        const iconSize = Math.min(element.size.width, element.size.height) * 0.6;
        return (
          <div className="w-full h-full flex items-center justify-center" style={{ color: style.color }}>
            <Star style={{ width: iconSize, height: iconSize }} />
          </div>
        );

      case 'barcode':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center bg-white border rounded p-2">
            <QrCode className="w-full h-full max-w-[80%] max-h-[80%] text-foreground" />
            {element.barcodeValue && (
              <span className="text-[8px] text-muted-foreground mt-1 truncate max-w-full">
                {element.barcodeValue}
              </span>
            )}
          </div>
        );

      case 'image':
        const imageTransform = [
          element.flipHorizontal && 'scaleX(-1)',
          element.flipVertical && 'scaleY(-1)',
        ].filter(Boolean).join(' ');

        return (
          <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded overflow-hidden">
            {element.imageUrl ? (
              <img
                src={element.imageUrl}
                alt=""
                className="max-w-full max-h-full"
                style={{
                  objectFit: element.objectFit || 'contain',
                  filter: getFilterString(element.imageFilters),
                  transform: imageTransform || undefined,
                }}
              />
            ) : (
              <div className="text-muted-foreground text-xs">Drop image or click to upload</div>
            )}
          </div>
        );

      case 'table':
        const { rows = 3, cols = 3, cells = [], headerRow, alternatingRowColors, alternatingColor } = element.tableData || { rows: 3, cols: 3, cells: [] };
        return (
          <table className="w-full h-full border-collapse text-xs">
            <tbody>
              {Array(rows).fill(null).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {Array(cols).fill(null).map((_, colIndex) => (
                    <td
                      key={colIndex}
                      className={cn(
                        "border border-border p-1",
                        headerRow && rowIndex === 0 && "font-bold bg-muted"
                      )}
                      style={{
                        ...contentStyle,
                        backgroundColor: !headerRow || rowIndex > 0
                          ? (alternatingRowColors && rowIndex % 2 === 1
                            ? alternatingColor || '#f9fafb'
                            : undefined)
                          : undefined,
                      }}
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
        const hasGradient = !!element.style?.gradient;
        const gradientId = `grad-${element.id}`;

        const shapeStyle: React.CSSProperties = {
          background: hasGradient
            ? getGradientString(element.style.gradient)
            : (style.backgroundColor || undefined),
          borderRadius: element.shapeType === 'circle' ? '50%' :
            element.shapeType === 'ellipse' ? '50%' :
              (typeof style.borderRadius === 'number' ? style.borderRadius : 0),
        };

        if (element.shapeType === 'line') {
          return (
            <div
              className="w-full h-0.5 bg-current"
              style={{
                background: hasGradient
                  ? getGradientString(element.style.gradient)
                  : (style.strokeColor || style.color),
                height: style.strokeWidth || 2,
              }}
            />
          );
        }

        // Complex shapes with SVG
        if (['triangle', 'diamond', 'pentagon', 'hexagon', 'star', 'arrow'].includes(element.shapeType || '')) {
          const path = getShapePath(element.shapeType!, element.size.width, element.size.height);

          return (
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${element.size.width} ${element.size.height}`}
            >
              {hasGradient && element.style.gradient && (
                <defs>
                  {element.style.gradient.type === 'linear' ? (
                    <linearGradient
                      id={gradientId}
                      x1="0%" y1="0%" x2="100%" y2="0%"
                      gradientTransform={`rotate(${element.style.gradient.angle || 0} .5 .5)`}
                    >
                      {element.style.gradient.stops.map((stop, i) => (
                        <stop key={i} offset={`${stop.offset}%`} stopColor={stop.color} />
                      ))}
                    </linearGradient>
                  ) : (
                    <radialGradient id={gradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      {element.style.gradient.stops.map((stop, i) => (
                        <stop key={i} offset={`${stop.offset}%`} stopColor={stop.color} />
                      ))}
                    </radialGradient>
                  )}
                </defs>
              )}

              <path
                d={path}
                fill={hasGradient ? `url(#${gradientId})` : (style.backgroundColor || '#e5e7eb')}
                stroke={style.strokeColor || 'none'}
                strokeWidth={style.strokeWidth || 0}
                strokeDasharray={
                  style.strokeStyle === 'dashed' ? '8,4' :
                    style.strokeStyle === 'dotted' ? '2,2' :
                      'none'
                }
              />
            </svg>
          );
        }

        // Rectangle, circle, ellipse (CSS based)
        return (
          <div
            className="w-full h-full"
            style={{
              ...shapeStyle,
              border: (style.strokeWidth || 0) > 0
                ? `${style.strokeWidth}px ${style.strokeStyle || 'solid'} ${style.strokeColor || '#000'}`
                : undefined,
            }}
          />
        );

      case 'divider':
        return (
          <div
            className="w-full"
            style={{
              height: style.strokeWidth || 2,
              background: element.style?.gradient
                ? getGradientString(element.style.gradient)
                : (style.color || style.borderColor || '#e5e7eb'),
            }}
          />
        );

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

  // Calculate border styles
  const borderRadius = typeof element.style?.borderRadius === 'number'
    ? element.style.borderRadius
    : 0;
  const borderWidth = element.style?.borderWidth || 0;
  const borderStyle = element.style?.border?.style || 'solid';
  const borderColor = element.style?.borderColor || '#e5e7eb';

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
        background: element.style?.gradient
          ? getGradientString(element.style.gradient)
          : (element.style?.backgroundColor !== 'transparent' ? element.style?.backgroundColor : undefined),
        borderRadius: borderRadius,
        opacity: element.style?.opacity,
        padding: typeof element.style?.padding === 'number' ? element.style?.padding : undefined,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        transformOrigin: 'center center',
        zIndex: element.zIndex || 0,
        boxShadow: getBoxShadowString(element.style?.boxShadow),
        border: borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : undefined,
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
