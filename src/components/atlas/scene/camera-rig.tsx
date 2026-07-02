"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { FaceRegion } from "@/data/atlas";
import { regionPoses } from "./scene-data";

type CameraRigProps = {
  selectedRegion: FaceRegion | null;
  viewZoom: number;
};

export function CameraRig({ selectedRegion, viewZoom }: CameraRigProps) {
  const { camera, size } = useThree();
  const target = useMemo(
    () => new THREE.Vector3(...(selectedRegion?.cameraTarget ?? [0, 0.06, 0.12])),
    [selectedRegion],
  );
  const targetPosition = useRef(new THREE.Vector3());
  const lookAtTarget = useRef(new THREE.Vector3());
  const desktopOffset = size.width >= 900 ? 0.34 : 0;

  useFrame(() => {
    if (!selectedRegion) {
      const overviewZ = size.width < 700 ? 6.7 : 5.85;
      targetPosition.current.set(desktopOffset, -0.04, overviewZ / viewZoom);
      lookAtTarget.current.set(desktopOffset, 0.05, 0.08);
      camera.position.lerp(targetPosition.current, 0.045);
      camera.lookAt(lookAtTarget.current);
      return;
    }

    const pose = regionPoses[selectedRegion.id];
    const mobileZoom = size.width < 700 ? 0.9 : 1;
    const z = selectedRegion.cameraPosition[2] / (viewZoom * pose.zoom * mobileZoom);
    const x = selectedRegion.cameraPosition[0] + desktopOffset + pose.panX;
    const y = selectedRegion.cameraPosition[1] * 0.35 + pose.panY;

    targetPosition.current.set(x, y, z);
    lookAtTarget.current.set(
      target.x + desktopOffset + pose.panX * 0.35,
      target.y + pose.panY * 0.25,
      target.z,
    );

    camera.position.lerp(targetPosition.current, 0.04);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}
