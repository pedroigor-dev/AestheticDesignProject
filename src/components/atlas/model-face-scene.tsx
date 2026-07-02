"use client";

import { ContactShadows, Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { CameraRig } from "@/components/atlas/scene/camera-rig";
import { FaceRig } from "@/components/atlas/scene/face-rig";
import { SceneFallback } from "@/components/atlas/scene/scene-fallback";
import { ModelFaceSceneProps } from "@/components/atlas/scene/scene-types";

export type { AtlasMode, ViewControl } from "@/components/atlas/scene/scene-types";

type ConsoleWithClockFilter = typeof console & {
  __aestheticClockFilter?: boolean;
};

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  const devConsole = console as ConsoleWithClockFilter;
  if (!devConsole.__aestheticClockFilter) {
    const originalWarn = devConsole.warn.bind(devConsole);
    devConsole.warn = (...args: unknown[]) => {
      const message = args.map(String).join(" ");
      if (message.includes("THREE.Clock: This module has been deprecated")) return;
      originalWarn(...args);
    };
    devConsole.__aestheticClockFilter = true;
  }
}

export function ModelFaceScene(props: ModelFaceSceneProps) {
  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-[#f6f1e8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_56%_30%,rgba(136,216,192,.25),transparent_26%),radial-gradient(circle_at_42%_76%,rgba(240,122,136,.16),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,13,.05)_1px,transparent_1px),linear-gradient(180deg,rgba(17,16,13,.035)_1px,transparent_1px)] bg-size-[72px_72px] opacity-40" />

      <Canvas
        camera={{ position: [0, 0.1, 4.8], fov: 28 }}
        dpr={[1, 1.65]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
        className="relative z-10 h-full w-full"
      >
        <Suspense fallback={<SceneFallback />}>
          <color attach="background" args={["#f6f1e8"]} />
          <fog attach="fog" args={["#f6f1e8", 7, 11]} />
          <ambientLight intensity={1.2} />
          <directionalLight position={[2.6, 3.4, 3.8]} intensity={2.8} />
          <directionalLight position={[-2.4, 1.2, 1.8]} intensity={0.9} color="#88d8c0" />
          <pointLight position={[1.8, -0.5, 2.2]} intensity={1.15} color="#f3b36f" />
          <CameraRig selectedRegion={props.selectedRegion} viewZoom={props.viewZoom} />
          <FaceRig {...props} />
          <ContactShadows position={[0, -1.74, 0]} opacity={0.18} blur={2.6} scale={4.2} />
          <Environment preset="studio" environmentIntensity={0.65} />
        </Suspense>
      </Canvas>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-56 bg-linear-to-b from-[#f6f1e8] via-[#f6f1e8]/70 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[34%] bg-linear-to-r from-[#f6f1e8] via-[#f6f1e8]/72 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-44 bg-linear-to-t from-[#f6f1e8] to-transparent" />
    </div>
  );
}
