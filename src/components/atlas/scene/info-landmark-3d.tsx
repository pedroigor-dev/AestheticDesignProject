"use client";

import { Html } from "@react-three/drei";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FaceLandmark, LandmarkId } from "./scene-types";

type InfoLandmark3DProps = {
  landmark: FaceLandmark;
  active: boolean;
  hovered: boolean;
  hasActiveLandmark: boolean;
  onHover: (id: LandmarkId | null) => void;
  onSelect: (id: LandmarkId) => void;
};

export function InfoLandmark3D({
  landmark,
  active,
  hovered,
  hasActiveLandmark,
  onHover,
  onSelect,
}: InfoLandmark3DProps) {
  const ref = useRef<THREE.Group>(null);
  const frameCount = useRef(0);
  const worldPosition = useRef(new THREE.Vector3());
  const worldQuaternion = useRef(new THREE.Quaternion());
  const worldNormal = useRef(new THREE.Vector3());
  const toCamera = useRef(new THREE.Vector3());
  const [isFacingCamera, setIsFacingCamera] = useState(false);
  const landmarkNormal = useMemo(
    () => new THREE.Vector3(...landmark.normal).normalize(),
    [landmark.normal],
  );
  const { camera } = useThree();
  const visible = active || (!hasActiveLandmark && hovered);

  useFrame((state) => {
    if (!ref.current) return;
    frameCount.current = (frameCount.current + 1) % 3;
    if (frameCount.current === 0) {
      ref.current.getWorldPosition(worldPosition.current);
      ref.current.getWorldQuaternion(worldQuaternion.current);
      worldNormal.current.copy(landmarkNormal).applyQuaternion(worldQuaternion.current).normalize();
      toCamera.current.copy(camera.position).sub(worldPosition.current).normalize();

      const nextFacing = worldNormal.current.dot(toCamera.current) > 0.78;
      setIsFacingCamera((current) => (current === nextFacing ? current : nextFacing));
    }

    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.1) * 0.035;
    const scale = visible ? 1.08 * pulse : 0.96;
    ref.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
  });

  const handleOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(landmark.id);
    document.body.style.cursor = "pointer";
  };

  const handleOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    onHover(null);
    document.body.style.cursor = "default";
  };

  return (
    <group ref={ref} position={landmark.position}>
      {isFacingCamera && (
        <>
          <mesh
            onPointerDown={(event) => {
              event.stopPropagation();
              onSelect(landmark.id);
            }}
            onClick={(event) => {
              event.stopPropagation();
            }}
            onPointerOver={handleOver}
            onPointerOut={handleOut}
          >
            <sphereGeometry args={[0.15, 16, 8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.045, 16, 8]} />
            <meshStandardMaterial
              color="#fff8ec"
              emissive="#88d8c0"
              emissiveIntensity={visible ? 0.34 : 0.12}
              roughness={0.28}
            />
          </mesh>
          <Html center className="pointer-events-auto select-none">
            <button
              type="button"
              aria-label={`Abrir informacao: ${landmark.label}`}
              className="grid size-5 cursor-pointer place-items-center rounded-full border border-black/10 bg-[#fffaf0]/88 text-[10px] font-bold text-black/45 shadow-lg shadow-black/10 backdrop-blur-md transition hover:scale-110 hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#88d8c0]/55"
              onPointerDown={(event) => {
                event.stopPropagation();
                onSelect(landmark.id);
              }}
              onPointerUp={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              onPointerEnter={() => {
                onHover(landmark.id);
                document.body.style.cursor = "pointer";
              }}
              onPointerLeave={() => {
                onHover(null);
                document.body.style.cursor = "default";
              }}
            >
              i
            </button>
          </Html>
          {visible && (
            <Html
              center
              zIndexRange={[80, 0]}
              position={[landmark.cardSide === "left" ? 0.5 : -0.5, -0.16, 0]}
              className="pointer-events-none select-none"
            >
              <div className="w-[190px] rounded-2xl border border-black/10 bg-[#fffaf0]/95 p-3 text-left shadow-2xl shadow-black/10 backdrop-blur-2xl">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45">
                  {landmark.label}
                </p>
                <p className="mt-2 text-xs leading-5 text-black/62">{landmark.text}</p>
              </div>
            </Html>
          )}
        </>
      )}
    </group>
  );
}
