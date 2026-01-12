import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DrawingPath, DrawingTool } from '@/types/editor';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

interface DrawingCanvasProps {
  width: number;
  height: number;
  zoom: number;
  isActive: boolean;
  tool: DrawingTool;
  color: string;
  strokeWidth: number;
  paths: DrawingPath[];
  onPathsChange: (paths: DrawingPath[]) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  zoom,
  isActive,
  tool,
  color,
  strokeWidth,
  paths,
  onPathsChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);
  const scale = zoom / 100;

  // Redraw all paths
  const redrawPaths = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    paths.forEach((path) => {
      if (path.points.length < 2) return;

      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = path.opacity;

      if (path.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.lineWidth = path.width * 3;
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      ctx.stroke();
    });

    // Draw current path
    if (currentPath && currentPath.points.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = currentPath.color;
      ctx.lineWidth = currentPath.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.globalAlpha = currentPath.opacity;

      if (currentPath.tool === 'highlighter') {
        ctx.globalCompositeOperation = 'multiply';
        ctx.lineWidth = currentPath.width * 3;
      } else {
        ctx.globalCompositeOperation = 'source-over';
      }

      ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
      for (let i = 1; i < currentPath.points.length; i++) {
        ctx.lineTo(currentPath.points[i].x, currentPath.points[i].y);
      }
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }, [paths, currentPath, width, height]);

  useEffect(() => {
    redrawPaths();
  }, [redrawPaths]);

  const getCanvasPoint = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) return;

    const point = getCanvasPoint(e);

    if (tool === 'eraser') {
      // Find and remove paths near the click point
      const eraserRadius = strokeWidth * 2;
      const remainingPaths = paths.filter((path) => {
        return !path.points.some(
          (p) =>
            Math.abs(p.x - point.x) < eraserRadius &&
            Math.abs(p.y - point.y) < eraserRadius
        );
      });
      if (remainingPaths.length !== paths.length) {
        onPathsChange(remainingPaths);
      }
      return;
    }

    setIsDrawing(true);
    setCurrentPath({
      id: uuidv4(),
      tool,
      points: [point],
      color: tool === 'highlighter' ? color + '80' : color,
      width: strokeWidth,
      opacity: tool === 'highlighter' ? 0.4 : 1,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentPath || !isActive) return;

    const point = getCanvasPoint(e);
    setCurrentPath((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point],
      };
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentPath) return;

    if (currentPath.points.length >= 2) {
      onPathsChange([...paths, currentPath]);
    }

    setIsDrawing(false);
    setCurrentPath(null);
  };

  const handleMouseLeave = () => {
    if (isDrawing && currentPath && currentPath.points.length >= 2) {
      onPathsChange([...paths, currentPath]);
    }
    setIsDrawing(false);
    setCurrentPath(null);
  };

  const getCursorStyle = (): string => {
    if (!isActive) return 'default';
    switch (tool) {
      case 'pen':
        return 'crosshair';
      case 'highlighter':
        return 'crosshair';
      case 'eraser':
        return 'cell';
      default:
        return 'crosshair';
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={cn(
        "absolute inset-0 z-50",
        isActive ? "pointer-events-auto" : "pointer-events-none"
      )}
      style={{
        cursor: getCursorStyle(),
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    />
  );
};
