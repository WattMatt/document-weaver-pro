import React from 'react';
import { X, Download, Printer, ZoomIn, ZoomOut } from 'lucide-react';
import { Template, DocumentElement } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
}

const PAGE_SIZES = {
  A4: { width: 595, height: 842 },
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  isOpen,
  onClose,
  template,
}) => {
  const [previewZoom, setPreviewZoom] = React.useState(80);

  if (!isOpen || !template) return null;

  const pageSize = PAGE_SIZES[template.pageSize];
  const isLandscape = template.orientation === 'landscape';
  const width = isLandscape ? pageSize.height : pageSize.width;
  const height = isLandscape ? pageSize.width : pageSize.height;
  const scale = previewZoom / 100;

  const renderElement = (element: DocumentElement) => {
    if (element.visible === false) return null;

    const style: React.CSSProperties = {
      position: 'absolute',
      left: element.position.x,
      top: element.position.y,
      width: element.size.width,
      height: element.size.height,
      fontSize: element.style.fontSize,
      fontWeight: element.style.fontWeight as any,
      color: element.style.color,
      backgroundColor: element.style.backgroundColor !== 'transparent' ? element.style.backgroundColor : undefined,
      textAlign: element.style.textAlign,
      borderRadius: element.style.borderRadius,
      padding: element.style.padding,
    };

    switch (element.type) {
      case 'text':
      case 'header':
      case 'footer':
        return (
          <div key={element.id} style={style}>
            {element.content}
          </div>
        );

      case 'dynamic-field':
        return (
          <div key={element.id} style={style}>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs border border-primary/30">
              {element.dynamicField || element.content}
            </span>
          </div>
        );

      case 'image':
        return (
          <div key={element.id} style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {element.imageUrl ? (
              <img src={element.imageUrl} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <div className="bg-muted/50 w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                Image
              </div>
            )}
          </div>
        );

      case 'table':
        const { rows = 3, cols = 3, cells = [] } = element.tableData || {};
        return (
          <div key={element.id} style={style}>
            <table className="w-full h-full border-collapse">
              <tbody>
                {Array(rows).fill(null).map((_, rowIndex) => (
                  <tr key={rowIndex}>
                    {Array(cols).fill(null).map((_, colIndex) => (
                      <td
                        key={colIndex}
                        className="border border-border p-1 text-xs"
                      >
                        {cells[rowIndex]?.[colIndex]?.content || ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'shape':
        const shapeStyle: React.CSSProperties = {
          ...style,
          backgroundColor: element.style.backgroundColor,
          borderRadius: element.shapeType === 'circle' ? '50%' : element.style.borderRadius,
        };
        if (element.shapeType === 'line') {
          return (
            <div
              key={element.id}
              style={{ ...style, height: 2, backgroundColor: element.style.color }}
            />
          );
        }
        return <div key={element.id} style={shapeStyle} />;

      case 'divider':
        return (
          <div
            key={element.id}
            style={{ ...style, height: 2, backgroundColor: 'hsl(var(--border))' }}
          />
        );

      case 'signature':
        return (
          <div
            key={element.id}
            style={style}
            className="border-b-2 border-dashed border-muted-foreground/30 flex items-end justify-center"
          >
            <span className="text-xs text-muted-foreground pb-2">Signature</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col animate-fade-in">
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-4">
        <div>
          <h2 className="font-semibold">Preview: {template.name}</h2>
          <p className="text-xs text-muted-foreground">
            {template.pageSize} • {template.orientation}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewZoom(Math.max(25, previewZoom - 10))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm w-12 text-center">{previewZoom}%</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setPreviewZoom(Math.min(200, previewZoom + 10))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          <Button variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-1.5" />
            Print
          </Button>
          <Button size="sm">
            <Download className="w-4 h-4 mr-1.5" />
            Download PDF
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-8 flex justify-center bg-muted/30">
        <div
          className="bg-paper shadow-2xl relative"
          style={{
            width: width * scale,
            height: height * scale,
            minWidth: width * scale,
            minHeight: height * scale,
          }}
        >
          <div
            className="absolute inset-0 origin-top-left"
            style={{
              transform: `scale(${scale})`,
              width: width,
              height: height,
            }}
          >
            {template.elements.map(renderElement)}
          </div>
        </div>
      </div>
    </div>
  );
};
