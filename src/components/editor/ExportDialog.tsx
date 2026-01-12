import React, { useState } from 'react';
import {
  Download,
  FileText,
  Image,
  FileCode,
  Settings,
} from 'lucide-react';
import { ExportSettings } from '@/types/editor';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (settings: ExportSettings) => void;
}

const formatOptions = [
  { id: 'pdf', label: 'PDF', icon: <FileText className="w-5 h-5" />, description: 'Best for sharing and printing' },
  { id: 'png', label: 'PNG', icon: <Image className="w-5 h-5" />, description: 'High quality image with transparency' },
  { id: 'jpg', label: 'JPG', icon: <Image className="w-5 h-5" />, description: 'Compressed image, smaller file size' },
  { id: 'svg', label: 'SVG', icon: <FileCode className="w-5 h-5" />, description: 'Scalable vector format' },
  { id: 'pptx', label: 'PPTX', icon: <FileText className="w-5 h-5" />, description: 'PowerPoint presentation' },
];

export const ExportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'pdf',
    quality: 90,
    compression: 'medium',
    dpi: 150,
    includeAnnotations: true,
    flattenLayers: false,
  });

  const handleExport = () => {
    onExport(settings);
    onClose();
  };

  const isImageFormat = settings.format === 'png' || settings.format === 'jpg';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <div className="grid grid-cols-5 gap-2">
              {formatOptions.map((format) => (
                <button
                  key={format.id}
                  className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                    settings.format === format.id
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                  onClick={() =>
                    setSettings((prev) => ({ ...prev, format: format.id as ExportSettings['format'] }))
                  }
                >
                  {format.icon}
                  <span className="text-xs font-medium">{format.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatOptions.find((f) => f.id === settings.format)?.description}
            </p>
          </div>

          <Separator />

          {/* Quality Settings for Images */}
          {isImageFormat && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Quality</Label>
                <span className="text-sm text-muted-foreground">{settings.quality}%</span>
              </div>
              <Slider
                value={[settings.quality || 90]}
                onValueChange={([value]) => setSettings((prev) => ({ ...prev, quality: value }))}
                min={10}
                max={100}
                step={5}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Higher quality</span>
              </div>
            </div>
          )}

          {/* DPI for Images */}
          {isImageFormat && (
            <div className="space-y-2">
              <Label>Resolution (DPI)</Label>
              <Select
                value={String(settings.dpi)}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, dpi: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="72">72 DPI (Screen)</SelectItem>
                  <SelectItem value="150">150 DPI (Standard)</SelectItem>
                  <SelectItem value="300">300 DPI (Print)</SelectItem>
                  <SelectItem value="600">600 DPI (High Quality)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* PDF Compression */}
          {settings.format === 'pdf' && (
            <div className="space-y-2">
              <Label>Compression Level</Label>
              <RadioGroup
                value={settings.compression}
                onValueChange={(value) =>
                  setSettings((prev) => ({
                    ...prev,
                    compression: value as ExportSettings['compression'],
                  }))
                }
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="none" id="none" />
                  <Label htmlFor="none" className="font-normal">None</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low" className="font-normal">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium" className="font-normal">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high" className="font-normal">High</Label>
                </div>
              </RadioGroup>
            </div>
          )}

          <Separator />

          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              Additional Options
            </Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Include Annotations</p>
                  <p className="text-xs text-muted-foreground">
                    Export comments, notes, and stamps
                  </p>
                </div>
                <Switch
                  checked={settings.includeAnnotations}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, includeAnnotations: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Flatten Layers</p>
                  <p className="text-xs text-muted-foreground">
                    Merge all layers into a single layer
                  </p>
                </div>
                <Switch
                  checked={settings.flattenLayers}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, flattenLayers: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 mr-1" />
            Export {settings.format.toUpperCase()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
