"use client";

import { Html } from "@react-three/drei";

export function SceneFallback() {
  return (
    <Html center>
      <div className="rounded-full border border-black/10 bg-[#fffaf0]/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/55 shadow-xl backdrop-blur-md">
        Carregando modelo 3D
      </div>
    </Html>
  );
}
