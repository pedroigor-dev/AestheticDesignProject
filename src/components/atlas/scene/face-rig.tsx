"use client";

import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { RegionId } from "@/data/atlas";
import { AtlasModeOverlay } from "./atlas-mode-overlay";
import { FaceHotspot3D } from "./face-hotspot-3d";
import { InfoLandmark3D } from "./info-landmark-3d";
import { faceLandmarks, faceModel, regionPoses } from "./scene-data";
import { LandmarkId, ModelFaceSceneProps } from "./scene-types";

export function FaceRig({
  regions,
  selectedRegion,
  hoveredId,
  tilt,
  viewControl,
  resetSignal,
  atlasMode,
  onHover,
  onSelect,
  onReady,
}: ModelFaceSceneProps) {
  const rig = useRef<THREE.Group>(null);
  const readyAnnounced = useRef(false);
  const [activeLandmark, setActiveLandmark] = useState<LandmarkId | null>(null);
  const [hoveredLandmark, setHoveredLandmark] = useState<LandmarkId | null>(null);
  const { scene } = useGLTF(faceModel.path);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const normalization = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = faceModel.targetHeight / Math.max(size.y, 0.001);

    return {
      center,
      scale,
    };
  }, [clonedScene]);
  const { size } = useThree();
  const desktopOffset = size.width >= 900 ? 0.34 : 0;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setActiveLandmark(null);
      setHoveredLandmark(null);
      document.body.style.cursor = "default";
    });

    return () => cancelAnimationFrame(frame);
  }, [resetSignal]);

  useEffect(() => {
    clonedScene.traverse((object) => {
      if (!("isMesh" in object)) return;
      const mesh = object as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      if (mesh.material) {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const clonedMaterials = materials.map((material) => {
          const clonedMaterial = material.clone();
          if ("roughness" in clonedMaterial) {
            clonedMaterial.roughness = Math.min(Number(clonedMaterial.roughness ?? 0.55), 0.68);
          }
          if ("metalness" in clonedMaterial) {
            clonedMaterial.metalness = Math.min(Number(clonedMaterial.metalness ?? 0), 0.08);
          }
          return clonedMaterial;
        });
        mesh.material = Array.isArray(mesh.material) ? clonedMaterials : clonedMaterials[0];
      }
    });

    if (!readyAnnounced.current) {
      readyAnnounced.current = true;
      requestAnimationFrame(() => onReady?.());
    }
  }, [clonedScene, onReady]);

  useEffect(() => {
    clonedScene.traverse((object) => {
      if (!("isMesh" in object)) return;
      const mesh = object as THREE.Mesh;
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((material) => {
        material.transparent = atlasMode !== "aesthetic";
        material.opacity = atlasMode === "aesthetic" ? 1 : 0.58;
        material.depthWrite = atlasMode === "aesthetic";
      });
    });
  }, [atlasMode, clonedScene]);

  const showMobileMarkers = size.width < 768;

  useFrame((state) => {
    if (!rig.current) return;
    const pose = selectedRegion
      ? regionPoses[selectedRegion.id]
      : { yaw: 0, pitch: 0, zoom: 1, panX: 0, panY: 0 };
    const breath = Math.sin(state.clock.elapsedTime * 1.35) * 0.018;
    rig.current.position.x = THREE.MathUtils.lerp(
      rig.current.position.x,
      desktopOffset + viewControl.panX + tilt.x * 0.04,
      0.08,
    );
    rig.current.position.y = THREE.MathUtils.lerp(
      rig.current.position.y,
      viewControl.panY + breath + tilt.y * -0.02,
      0.08,
    );
    rig.current.rotation.y = THREE.MathUtils.lerp(
      rig.current.rotation.y,
      pose.yaw + viewControl.yaw + tilt.x * 0.22,
      0.075,
    );
    rig.current.rotation.x = THREE.MathUtils.lerp(
      rig.current.rotation.x,
      pose.pitch + viewControl.pitch - tilt.y * 0.1 + breath,
      0.075,
    );
    rig.current.rotation.z = THREE.MathUtils.lerp(rig.current.rotation.z, -tilt.x * 0.025, 0.075);
  });

  const clearLandmarkAndSelectRegion = (id: RegionId) => {
    setActiveLandmark(null);
    onSelect(id);
  };

  return (
    <group ref={rig}>
      <group
        position={[0, faceModel.verticalOffset, 0]}
        rotation={faceModel.rotation}
        scale={normalization.scale}
      >
        <primitive
          object={clonedScene}
          position={[
            -normalization.center.x,
            -normalization.center.y,
            -normalization.center.z,
          ]}
        />
      </group>
      <AtlasModeOverlay mode={atlasMode} />
      {regions.map((region) => (
        <FaceHotspot3D
          key={region.id}
          region={region}
          active={region.id === selectedRegion?.id}
          hovered={region.id === hoveredId}
          showMobileMarker={showMobileMarkers}
          onHover={onHover}
          onSelect={clearLandmarkAndSelectRegion}
        />
      ))}
      {faceLandmarks.map((landmark) => (
        <InfoLandmark3D
          key={landmark.id}
          landmark={landmark}
          active={activeLandmark === landmark.id}
          hovered={hoveredLandmark === landmark.id}
          hasActiveLandmark={activeLandmark !== null}
          onHover={setHoveredLandmark}
          onSelect={setActiveLandmark}
        />
      ))}
    </group>
  );
}
