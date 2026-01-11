import React from 'react';
import { Gradient, GradientStop } from '@/types/editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Minus, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GradientPickerProps {
    gradient?: Gradient;
    onChange: (gradient: Gradient | undefined) => void;
    defaultColor?: string;
}

export const GradientPicker: React.FC<GradientPickerProps> = ({
    gradient,
    onChange,
    defaultColor = '#ffffff'
}) => {
    const isGradient = !!gradient;

    const handleModeChange = (enabled: boolean) => {
        if (enabled) {
            onChange({
                type: 'linear',
                angle: 90,
                stops: [
                    { offset: 0, color: defaultColor },
                    { offset: 100, color: '#000000' }
                ]
            });
        } else {
            onChange(undefined);
        }
    };

    const updateGradient = (updates: Partial<Gradient>) => {
        if (!gradient) return;
        onChange({ ...gradient, ...updates });
    };

    const updateStop = (index: number, updates: Partial<GradientStop>) => {
        if (!gradient) return;
        const newStops = [...gradient.stops];
        newStops[index] = { ...newStops[index], ...updates };
        // Keep stops sorted by offset for visual logic if needed, but CSS handles unsorted fine.
        // Sorting internally might be better for UI, but let's just update for now.
        onChange({ ...gradient, stops: newStops });
    };

    const addStop = () => {
        if (!gradient) return;
        const newStop = { offset: 50, color: '#808080' };
        onChange({ ...gradient, stops: [...gradient.stops, newStop].sort((a, b) => a.offset - b.offset) });
    };

    const removeStop = (index: number) => {
        if (!gradient || gradient.stops.length <= 2) return;
        const newStops = gradient.stops.filter((_, i) => i !== index);
        onChange({ ...gradient, stops: newStops });
    };

    // Visual Gradient Bar
    const gradientBackground = gradient
        ? `linear-gradient(90deg, ${gradient.stops.map(s => `${s.color} ${s.offset}%`).join(', ')})`
        : defaultColor;

    return (
        <div className="space-y-4">
            {/* Mode Switcher */}
            <div className="flex bg-muted p-1 rounded-md">
                <button
                    className={cn(
                        "flex-1 text-xs py-1 px-2 rounded-sm transition-all",
                        !isGradient ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleModeChange(false)}
                >
                    Solid
                </button>
                <button
                    className={cn(
                        "flex-1 text-xs py-1 px-2 rounded-sm transition-all",
                        isGradient ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => handleModeChange(true)}
                >
                    Gradient
                </button>
            </div>

            {isGradient && gradient && (
                <div className="space-y-4 border rounded-md p-3 bg-card">
                    {/* Gradient Preview Bar */}
                    <div className="h-6 w-full rounded ring-1 ring-border shadow-sm mb-4" style={{ background: gradientBackground }} />

                    {/* Type & Angle */}
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Type</Label>
                            <Select
                                value={gradient.type}
                                onValueChange={(value: 'linear' | 'radial') => updateGradient({ type: value })}
                            >
                                <SelectTrigger className="h-7 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="linear">Linear</SelectItem>
                                    <SelectItem value="radial">Radial</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {gradient.type === 'linear' && (
                            <div className="w-24">
                                <Label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 block">Angle</Label>
                                <div className="relative">
                                    <RotateCw className="absolute left-2 top-1.5 w-3 h-3 text-muted-foreground opacity-50" />
                                    <Input
                                        type="number"
                                        value={gradient.angle || 0}
                                        onChange={(e) => updateGradient({ angle: Number(e.target.value) })}
                                        className="h-7 text-xs pl-6"
                                        min={0}
                                        max={360}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Stops */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Color Stops</Label>
                            <Button variant="outline" size="sm" className="h-5 text-[10px] px-2 h-6" onClick={addStop}>
                                <Plus className="w-3 h-3 mr-1" /> Add Stop
                            </Button>
                        </div>

                        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                            {gradient.stops.map((stop, index) => (
                                <div key={index} className="flex items-center gap-2 group">
                                    <input
                                        type="color"
                                        value={stop.color}
                                        onChange={(e) => updateStop(index, { color: e.target.value })}
                                        className="w-5 h-5 rounded border cursor-pointer border-input p-0 overflow-hidden"
                                    />
                                    <div className="flex-1">
                                        <Slider
                                            value={[stop.offset]}
                                            onValueChange={([val]) => updateStop(index, { offset: val })}
                                            min={0}
                                            max={100}
                                            step={1}
                                            className="py-1"
                                        />
                                    </div>
                                    <span className="text-[10px] font-mono w-8 text-right text-muted-foreground">{stop.offset}%</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                        disabled={gradient.stops.length <= 2}
                                        onClick={() => removeStop(index)}
                                    >
                                        <Minus className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
