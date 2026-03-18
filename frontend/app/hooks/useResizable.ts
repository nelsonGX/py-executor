import { useEffect, useRef, useState } from "react";

export function useResizable(
  containerRef: React.RefObject<HTMLDivElement | null>,
  initialHeight: number,
  min: number,
  maxRatio: number,
) {
  const [height, setHeight] = useState(initialHeight);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const startDrag = (clientY: number) => {
    isDragging.current = true;
    dragStartY.current = clientY;
    dragStartHeight.current = height;
    document.body.style.userSelect = "none";
  };

  const onMouseDown = (e: React.MouseEvent) => {
    startDrag(e.clientY);
    document.body.style.cursor = "ns-resize";
  };

  const onTouchStart = (e: React.TouchEvent) => {
    startDrag(e.touches[0].clientY);
  };

  useEffect(() => {
    const clamp = (clientY: number) => {
      if (!isDragging.current || !containerRef.current) return;
      const maxH = containerRef.current.clientHeight * maxRatio;
      const delta = dragStartY.current - clientY;
      setHeight(Math.min(Math.max(dragStartHeight.current + delta, min), maxH));
    };
    const onMove = (e: MouseEvent) => clamp(e.clientY);
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); clamp(e.touches[0].clientY); };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [containerRef, maxRatio, min]);

  return { height, setHeight, onMouseDown, onTouchStart };
}
