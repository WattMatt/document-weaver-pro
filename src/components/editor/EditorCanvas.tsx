import React, { useRef } from 'react';
import { DocumentElement, Template } from '@/types/editor';
import { CanvasElement } from './CanvasElement';
import { cn } from '@/lib/utils';

interface EditorCanvasProps {
  template: Template | null;
  selectedElementId: string | null;
  zoom: number;
  showGrid: boolean;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<DocumentElement>) => void;
}

const PAGE_SIZES = {
  A4: { width: 595, height: 842 }, // 72 DPI
  Letter: { width: 612, height: 792 },
  Legal: { width: 612, height: 1008 },
};

export const EditorCanvas: React.FC<EditorCanvasProps> = ({
  template,
  selectedElementId,
  zoom,
  showGrid,
  onSelectElement,
  onUpdateElement,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center bg-canvas">
        <p className="text-muted-foreground">No template loaded</p>
      </div>
    );
  }

  const pageSize = PAGE_SIZES[template.pageSize];
  const isLandscape = template.orientation === 'landscape';
  const width = isLandscape ? pageSize.height : pageSize.width;
  const height = isLandscape ? pageSize.width : pageSize.height;
  const scale = zoom / 100;

  return (
    <div
      ref={canvasRef}
      className={cn(
        "flex-1 overflow-auto p-8 flex items-start justify-center",
        showGrid ? "editor-canvas" : "bg-canvas"
      )}
      onClick={() => onSelectElement(null)}
    >
      <div
        className="editor-paper relative"
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
          {template.elements.map((element) => (
            <CanvasElement
              key={element.id}
              element={element}
              isSelected={element.id === selectedElementId}
              zoom={zoom}
              onSelect={() => onSelectElement(element.id)}
              onUpdate={(updates) => onUpdateElement(element.id, updates)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
