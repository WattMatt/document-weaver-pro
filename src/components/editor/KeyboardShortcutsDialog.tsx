import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutCategory {
  name: string;
  shortcuts: { keys: string[]; description: string }[];
}

const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
const cmdKey = isMac ? '⌘' : 'Ctrl';

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'File',
    shortcuts: [
      { keys: [cmdKey, 'S'], description: 'Save template' },
      { keys: [cmdKey, 'E'], description: 'Export document' },
      { keys: [cmdKey, 'P'], description: 'Preview document' },
    ],
  },
  {
    name: 'Edit',
    shortcuts: [
      { keys: [cmdKey, 'Z'], description: 'Undo' },
      { keys: [cmdKey, 'Shift', 'Z'], description: 'Redo' },
      { keys: [cmdKey, 'Y'], description: 'Redo (alternative)' },
      { keys: [cmdKey, 'D'], description: 'Duplicate element' },
      { keys: ['Delete'], description: 'Delete element' },
      { keys: ['Backspace'], description: 'Delete element' },
    ],
  },
  {
    name: 'Layer Order',
    shortcuts: [
      { keys: [']'], description: 'Bring element forward' },
      { keys: ['['], description: 'Send element backward' },
    ],
  },
  {
    name: 'Drawing',
    shortcuts: [
      { keys: [cmdKey, 'Shift', 'D'], description: 'Toggle drawing mode' },
    ],
  },
  {
    name: 'Panels',
    shortcuts: [
      { keys: ['1'], description: 'Switch to Elements panel' },
      { keys: ['2'], description: 'Switch to Layers panel' },
      { keys: ['3'], description: 'Switch to Pages panel' },
      { keys: ['4'], description: 'Switch to Styles panel' },
    ],
  },
  {
    name: 'General',
    shortcuts: [
      { keys: ['Escape'], description: 'Deselect element / Exit drawing mode' },
      { keys: [cmdKey, '+'], description: 'Zoom in' },
      { keys: [cmdKey, '-'], description: 'Zoom out' },
    ],
  },
];

export const KeyboardShortcutsDialog: React.FC<KeyboardShortcutsDialogProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-lg max-h-[80vh]"
        aria-describedby="keyboard-shortcuts-description"
      >
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription id="keyboard-shortcuts-description">
            Quick reference for all available keyboard shortcuts
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {shortcutCategories.map((category) => (
              <div key={category.name}>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {category.name}
                </h3>
                <div className="space-y-2">
                  {category.shortcuts.map((shortcut, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-sm text-muted-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <React.Fragment key={keyIdx}>
                            {keyIdx > 0 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                            <Badge 
                              variant="secondary" 
                              className="px-2 py-0.5 text-xs font-mono min-w-[24px] justify-center"
                            >
                              {key}
                            </Badge>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
