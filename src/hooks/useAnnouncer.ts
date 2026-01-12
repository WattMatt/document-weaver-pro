import { useCallback, useRef, useEffect } from 'react';

type AriaLiveRegion = 'polite' | 'assertive';

/**
 * Hook for announcing messages to screen readers.
 * Creates an ARIA live region that announces dynamic content changes.
 */
export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Create the announcer element if it doesn't exist
    let announcer = document.getElementById('aria-announcer') as HTMLDivElement | null;
    
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'aria-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(announcer);
    }
    
    announcerRef.current = announcer;

    return () => {
      // Don't remove on unmount as other components might use it
    };
  }, []);

  const announce = useCallback((message: string, priority: AriaLiveRegion = 'polite') => {
    if (!announcerRef.current) return;

    // Update the aria-live attribute based on priority
    announcerRef.current.setAttribute('aria-live', priority);
    
    // Clear and set the message to ensure it's announced
    announcerRef.current.textContent = '';
    
    // Use setTimeout to ensure the DOM updates and the message is announced
    setTimeout(() => {
      if (announcerRef.current) {
        announcerRef.current.textContent = message;
      }
    }, 50);
  }, []);

  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, [announce]);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, [announce]);

  return {
    announce,
    announcePolite,
    announceAssertive,
  };
}
