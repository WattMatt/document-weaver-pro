import { useCallback, useEffect, useRef } from 'react';

interface UseKeyboardNavigationOptions {
  /** Selector for focusable items within the container */
  itemSelector?: string;
  /** Enable wrapping from last to first item */
  wrap?: boolean;
  /** Orientation of the navigation */
  orientation?: 'horizontal' | 'vertical' | 'both';
  /** Callback when an item is activated */
  onActivate?: (element: HTMLElement) => void;
}

/**
 * Hook for keyboard navigation within a list or grid of items.
 * Supports arrow key navigation and Enter/Space activation.
 */
export function useKeyboardNavigation<T extends HTMLElement>(
  options: UseKeyboardNavigationOptions = {}
) {
  const {
    itemSelector = '[role="option"], [role="menuitem"], button, [tabindex="0"]',
    wrap = true,
    orientation = 'both',
    onActivate,
  } = options;

  const containerRef = useRef<T>(null);

  const getFocusableItems = useCallback((): HTMLElement[] => {
    if (!containerRef.current) return [];
    return Array.from(
      containerRef.current.querySelectorAll<HTMLElement>(itemSelector)
    ).filter(
      (el) => !el.hasAttribute('disabled') && el.getAttribute('aria-disabled') !== 'true'
    );
  }, [itemSelector]);

  const focusItem = useCallback((index: number, items: HTMLElement[]) => {
    if (items.length === 0) return;
    
    let targetIndex = index;
    if (wrap) {
      targetIndex = ((index % items.length) + items.length) % items.length;
    } else {
      targetIndex = Math.max(0, Math.min(index, items.length - 1));
    }
    
    items[targetIndex]?.focus();
  }, [wrap]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const items = getFocusableItems();
      if (items.length === 0) return;

      const currentIndex = items.findIndex((item) => item === document.activeElement);
      if (currentIndex === -1) return;

      let handled = false;
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = currentIndex - 1;
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            newIndex = currentIndex + 1;
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = currentIndex - 1;
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            newIndex = currentIndex + 1;
            handled = true;
          }
          break;
        case 'Home':
          newIndex = 0;
          handled = true;
          break;
        case 'End':
          newIndex = items.length - 1;
          handled = true;
          break;
        case 'Enter':
        case ' ':
          if (onActivate && document.activeElement instanceof HTMLElement) {
            event.preventDefault();
            onActivate(document.activeElement);
          }
          return;
      }

      if (handled) {
        event.preventDefault();
        focusItem(newIndex, items);
      }
    },
    [getFocusableItems, focusItem, orientation, onActivate]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    containerRef,
    getFocusableItems,
  };
}
