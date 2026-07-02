"use client";

import { PointerEvent, useCallback, useState } from "react";

export type PointerTilt = {
  x: number;
  y: number;
};

export function usePointerTilt() {
  const [tilt, setTilt] = useState<PointerTilt>({ x: 0, y: 0 });

  const handlePointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({
      x: Number((x * 2).toFixed(3)),
      y: Number((y * 2).toFixed(3)),
    });
  }, []);

  const resetTilt = useCallback(() => setTilt({ x: 0, y: 0 }), []);

  return { tilt, handlePointerMove, resetTilt };
}
