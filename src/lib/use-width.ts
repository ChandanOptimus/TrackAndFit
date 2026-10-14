"use client";

import { useCallback, useRef, useState } from "react";

/** Callback ref plus the element's current width in pixels (0 until measured). Updates on resize. */
export function useElementWidth(): [(node: HTMLElement | null) => void, number] {
  const [width, setWidth] = useState(0);
  const observer = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: HTMLElement | null) => {
    observer.current?.disconnect();
    observer.current = null;
    if (!node) return;
    setWidth(node.getBoundingClientRect().width);
    observer.current = new ResizeObserver(() => setWidth(node.getBoundingClientRect().width));
    observer.current.observe(node);
  }, []);

  return [ref, width];
}
