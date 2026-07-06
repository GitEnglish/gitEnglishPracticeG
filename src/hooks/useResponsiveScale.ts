export const useResponsiveScale = (
  targetWidth: () => number,
  contentRef: () => HTMLElement | null,
  maxScale: () => number = () => 1.5
) => {
  let scale = $state(1);

  $effect(() => {
    const calculateScale = () => {
      const el = contentRef();
      if (el) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        const horizontalPadding = 40;
        const verticalPadding = 40;

        const effectiveViewportWidth = viewportWidth - horizontalPadding;
        const effectiveViewportHeight = viewportHeight - verticalPadding;

        const currentTargetWidth = targetWidth();
        const currentMaxScale = maxScale();

        const scaleToFitWidth = effectiveViewportWidth / currentTargetWidth;
        const minScaleDown = 0.5;
        let newScale = 1;

        if (currentTargetWidth * currentMaxScale > effectiveViewportWidth) {
          newScale = scaleToFitWidth;
        } else {
          newScale = currentMaxScale;
        }

        if (currentMaxScale > 2) {
             const contentHeight = el.scrollHeight;
             const scaleToFitHeight = effectiveViewportHeight / contentHeight;
             newScale = Math.min(newScale, scaleToFitHeight);
        }

        newScale = Math.min(currentMaxScale, Math.max(minScaleDown, newScale));
        scale = newScale;
      }
    };

    window.addEventListener('resize', calculateScale);
    const timeout = setTimeout(calculateScale, 100);

    return () => {
      window.removeEventListener('resize', calculateScale);
      clearTimeout(timeout);
    };
  });

  return {
    get current() {
      return scale;
    }
  };
};
