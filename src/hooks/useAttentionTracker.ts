// Porting to Svelte 5 will require replacing useActivityLogger context with a store or global instance.
// For now, we will assume a global ActivityLogger instance export from services/ActivityLogger.ts
import { getActivityLogger } from '../services/ActivityLogger';

export const useAttentionTracker = (
  targetRef: () => HTMLElement | null,
  isActive: () => boolean = () => true,
  throttleMs: number = 100
) => {
  $effect(() => {
    const element = targetRef();
    const active = isActive();
    const logger = getActivityLogger();
    if (!element || !active || !logger) return;

    let lastLogTime = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastLogTime < throttleMs) return;

      const rect = element.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);

      if (x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
          logger.logStreamEvent('cursor_gaze', {
              x,
              y,
              w: Math.round(rect.width),
              h: Math.round(rect.height)
          });
          lastLogTime = now;
      }
    };

    const handleMouseEnter = () => {
      logger.logStreamEvent('gaze_enter', { timestamp: Date.now() });
    };

    const handleMouseLeave = () => {
      logger.logStreamEvent('gaze_leave', { timestamp: Date.now() });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  });
};
