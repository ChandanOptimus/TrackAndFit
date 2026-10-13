"use client";

import { useCallback, useRef } from "react";

/**
 * Callback ref that keeps a CSS variable on <html> equal to the element's height.
 * Sticky elements use these variables to stack below each other, e.g.
 * `top: calc(var(--nav-h) + var(--weight-form-h))`. The variable is removed on unmount.
 */
export function useHeightVar(name: string) {
  const observer = useRef<ResizeObserver | null>(null);

  return useCallback(
    (node: HTMLElement | null) => {
      observer.current?.disconnect();
      observer.current = null;
      const root = document.documentElement;
      if (!node) {
        root.style.removeProperty(name);
        return;
      }
      const update = () => root.style.setProperty(name, `${node.getBoundingClientRect().height}px`);
      update();
      observer.current = new ResizeObserver(update);
      observer.current.observe(node);
    },
    [name],
  );
}
