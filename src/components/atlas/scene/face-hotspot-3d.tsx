"use client";

import { Html } from "@react-three/drei";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { FaceRegion, RegionId } from "@/data/atlas";
import { hotspotPositions, hotspotScales } from "./scene-data";

type FaceHotspot3DProps = {
  region: FaceRegion;
  active: boolean;
  hovered: boolean;
  showMobileMarker: boolean;
  onHover: (id: RegionId | null) => void;
  onSelect: (id: RegionId) => void;
};

export function FaceHotspot3D({
  region,
  active,
  hovered,
  showMobileMarker,
  onHover,
  onSelect,
}: FaceHotspot3DProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.4) * 0.03;
    const scale = active ? 1.04 * pulse : hovered ? 1.02 : 1;
    ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
  });

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(region.id);
    document.body.style.cursor = "pointer";
  };

  const handleOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(null);
    document.body.style.cursor = "default";
  };

  const handleSelect = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(region.id);
  };

  const handleTouchSelect = (event: ThreeEvent<PointerEvent>) => {
    if ((event.nativeEvent as PointerEvent).pointerType !== "touch") return;
    event.stopPropagation();
    onSelect(region.id);
  };

  return (
    <group ref={ref} position={hotspotPositions[region.id]}>
      <mesh
        scale={hotspotScales[region.id]}
        onPointerDown={handleTouchSelect}
        onClick={handleSelect}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {showMobileMarker && !active && !hovered && (
        <mesh userData={{ testId: `mobile-marker-${region.id}` }}>
          <sphereGeometry args={[0.026, 24, 12]} />
          <meshStandardMaterial
            color={region.accent}
            emissive={region.accent}
            emissiveIntensity={0.32}
            opacity={0.78}
            roughness={0.28}
            transparent
          />
        </mesh>
      )}
      {(active || hovered) && (
        <>
          <mesh>
            <sphereGeometry args={[0.035, 32, 16]} />
            <meshStandardMaterial
              color={region.accent}
              emissive={region.accent}
              emissiveIntensity={0.55}
              roughness={0.25}
            />
          </mesh>
          <Html center position={[0, 0.12, 0]} className="pointer-events-none select-none">
            <span className="whitespace-nowrap rounded-full border border-black/10 bg-[#fffaf0]/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#14110e] shadow-xl shadow-black/10 backdrop-blur-md">
              {region.shortName}
            </span>
          </Html>
        </>
      )}
    </group>
  );
}
