"use client";

import { Html } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import { anatomyCurves, vesselCurves } from "./scene-data";
import { AtlasMode, CurvePath } from "./scene-types";

export function AtlasModeOverlay({ mode }: { mode: AtlasMode }) {
  if (mode === "aesthetic") return null;

  return (
    <group>
      {mode === "anatomy" && (
        <>
          <AnatomyPlane
            label="Tercos faciais"
            color="#88d8c0"
            opacity={0.16}
            position={[0, 0.38, 0.82]}
            scale={[0.92, 0.22, 1]}
          />
          <AnatomyPlane
            label="Compartimento medio"
            color="#f3b36f"
            opacity={0.13}
            position={[0, 0.02, 0.86]}
            scale={[0.78, 0.26, 1]}
          />
          <AnatomyPlane
            label="Suporte inferior"
            color="#9cb7ff"
            opacity={0.16}
            position={[0, -0.34, 0.76]}
            scale={[0.78, 0.2, 1]}
          />
          {anatomyCurves.map((curve) => (
            <AnatomyCurve key={curve.id} curve={curve} />
          ))}
        </>
      )}

      {mode === "muscles" && (
        <>
          <AnatomyPlane
            label="Frontal"
            color="#d96565"
            opacity={0.24}
            position={[0, 0.54, 0.75]}
            scale={[0.56, 0.28, 1]}
          />
          <AnatomyPlane
            label="Orbicular dos olhos"
            color="#f07a88"
            opacity={0.28}
            position={[-0.22, 0.2, 0.86]}
            scale={[0.2, 0.1, 1]}
          />
          <AnatomyPlane
            label="Orbicular dos olhos"
            color="#f07a88"
            opacity={0.28}
            position={[0.22, 0.2, 0.86]}
            scale={[0.2, 0.1, 1]}
          />
          <AnatomyPlane
            label="Orbicular da boca"
            color="#f07a88"
            opacity={0.3}
            position={[0, -0.13, 0.91]}
            scale={[0.34, 0.13, 1]}
          />
          <AnatomyPlane
            label="Masseter"
            color="#d96565"
            opacity={0.34}
            position={[-0.46, -0.17, 0.56]}
            rotation={[0, -0.42, 0]}
            scale={[0.2, 0.32, 1]}
          />
          <AnatomyPlane
            label="Masseter"
            color="#d96565"
            opacity={0.34}
            position={[0.46, -0.17, 0.56]}
            rotation={[0, 0.42, 0]}
            scale={[0.2, 0.32, 1]}
          />
        </>
      )}

      {mode === "vessels" && (
        <>
          {vesselCurves.map((curve) => (
            <AnatomyCurve key={curve.id} curve={curve} />
          ))}
          <VesselPoint position={[-0.18, 0.25, 0.86]} label="Supraorbital" />
          <VesselPoint position={[0.18, 0.25, 0.86]} label="Supraorbital" />
          <VesselPoint position={[-0.32, -0.02, 0.78]} label="Facial" />
          <VesselPoint position={[0.32, -0.02, 0.78]} label="Facial" />
        </>
      )}
    </group>
  );
}

function AnatomyPlane({
  label,
  color,
  opacity,
  position,
  rotation = [0, 0, 0],
  scale,
}: {
  label: string;
  color: string;
  opacity: number;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh scale={scale} renderOrder={3}>
        <circleGeometry args={[1, 64]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={opacity}
          depthWrite={false}
          depthTest={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Html center position={[0, scale[1] + 0.06, 0]} className="pointer-events-none select-none">
        <span className="whitespace-nowrap rounded-full border border-black/10 bg-[#fffaf0]/86 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-black/55 shadow-lg shadow-black/8 backdrop-blur-md">
          {label}
        </span>
      </Html>
    </group>
  );
}

function AnatomyCurve({ curve }: { curve: CurvePath }) {
  const path = useMemo(
    () => new THREE.CatmullRomCurve3(curve.points.map((point) => new THREE.Vector3(...point))),
    [curve.points],
  );

  return (
    <mesh renderOrder={4}>
      <tubeGeometry args={[path, 44, curve.radius, 8, false]} />
      <meshBasicMaterial
        color={curve.color}
        transparent
        opacity={curve.opacity}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

function VesselPoint({
  position,
  label,
}: {
  position: [number, number, number];
  label: string;
}) {
  return (
    <group position={position}>
      <mesh renderOrder={5}>
        <sphereGeometry args={[0.032, 18, 10]} />
        <meshBasicMaterial color="#fff8ec" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <Html center position={[0.1, 0.04, 0]} className="pointer-events-none select-none">
        <span className="whitespace-nowrap rounded-full border border-[#e65555]/20 bg-[#fffaf0]/88 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#b94343] shadow-lg shadow-black/8 backdrop-blur-md">
          {label}
        </span>
      </Html>
    </group>
  );
}
