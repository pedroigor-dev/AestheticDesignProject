"use client";

import { Canvas, ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Html,
  useGLTF,
} from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { FaceRegion, RegionId } from "@/data/atlas";
import { PointerTilt } from "@/hooks/use-pointer-tilt";

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

type ModelConfig = {
  label: string;
  path: string;
  targetHeight: number;
  verticalOffset: number;
  rotation: [number, number, number];
};

const faceModel: ModelConfig = {
  label: "Rosto",
  path: "/assets/maleface.glb",
  targetHeight: 2.12,
  verticalOffset: -0.1,
  rotation: [0, 0, 0],
};

export type ViewControl = {
  yaw: number;
  pitch: number;
  panX: number;
  panY: number;
};

type RegionPose = {
  yaw: number;
  pitch: number;
  zoom: number;
  panX: number;
  panY: number;
};

const hotspotPositions: Record<RegionId, [number, number, number]> = {
  scalp: [0, 0.82, 0.46],
  forehead: [0, 0.5, 0.62],
  eyes: [0, 0.2, 0.78],
  nose: [0, 0.03, 0.9],
  mouth: [0, -0.12, 0.86],
  jaw: [0, -0.42, 0.62],
};

const hotspotScales: Record<RegionId, [number, number, number]> = {
  scalp: [0.42, 0.24, 0.18],
  forehead: [0.48, 0.22, 0.18],
  eyes: [0.72, 0.24, 0.2],
  nose: [0.28, 0.36, 0.2],
  mouth: [0.46, 0.2, 0.18],
  jaw: [0.62, 0.24, 0.2],
};

const regionPoses: Record<RegionId, RegionPose> = {
  eyes: { yaw: 0.08, pitch: -0.02, zoom: 1.34, panX: 0.02, panY: 0.03 },
  nose: { yaw: -0.08, pitch: -0.01, zoom: 1.42, panX: 0, panY: 0 },
  mouth: { yaw: 0.05, pitch: 0.08, zoom: 1.42, panX: 0.01, panY: -0.06 },
  jaw: { yaw: -0.24, pitch: 0.1, zoom: 1.46, panX: -0.03, panY: -0.08 },
  forehead: { yaw: 0.1, pitch: -0.08, zoom: 1.38, panX: 0.01, panY: 0.08 },
  scalp: { yaw: 0.15, pitch: -0.12, zoom: 1.3, panX: 0.02, panY: 0.12 },
};

type LandmarkId =
  | "leftEar"
  | "rightEar"
  | "leftZygoma"
  | "rightZygoma"
  | "leftMandibularAngle"
  | "rightMandibularAngle"
  | "leftTemple"
  | "rightTemple";

type FaceLandmark = {
  id: LandmarkId;
  label: string;
  text: string;
  position: [number, number, number];
  normal: [number, number, number];
  cardSide: "left" | "right";
};

const faceLandmarks: FaceLandmark[] = [
  {
    id: "leftEar",
    label: "Orelha esquerda",
    text: "Referencia lateral importante para proporcao facial, suporte de oculos e leitura do perfil.",
    position: [-0.74, 0.08, 0.18],
    normal: [-1, 0, 0],
    cardSide: "left",
  },
  {
    id: "rightEar",
    label: "Orelha direita",
    text: "Ajuda a perceber alinhamento lateral, altura do terco medio e leitura do perfil.",
    position: [0.74, 0.08, 0.18],
    normal: [1, 0, 0],
    cardSide: "right",
  },
  {
    id: "leftZygoma",
    label: "Maca esquerda",
    text: "A regiao zigomatica influencia luz, suporte medio da face e transicao com olheiras.",
    position: [-0.46, 0.03, 0.58],
    normal: [-0.55, 0, 0.75],
    cardSide: "left",
  },
  {
    id: "rightZygoma",
    label: "Maca direita",
    text: "A regiao zigomatica influencia luz, suporte medio da face e transicao com olheiras.",
    position: [0.46, 0.03, 0.58],
    normal: [0.55, 0, 0.75],
    cardSide: "right",
  },
  {
    id: "leftMandibularAngle",
    label: "Angulo esquerdo",
    text: "Ponto-chave do contorno inferior; muda bastante com masseter, gordura e flacidez.",
    position: [-0.6, -0.23, 0.24],
    normal: [-0.85, 0, 0.25],
    cardSide: "left",
  },
  {
    id: "rightMandibularAngle",
    label: "Angulo direito",
    text: "Mostra a transicao entre masseter, linha mandibular e volume inferior da face.",
    position: [0.6, -0.23, 0.24],
    normal: [0.85, 0, 0.25],
    cardSide: "right",
  },
  {
    id: "leftTemple",
    label: "Temporal esquerdo",
    text: "A tempora participa da harmonia superior do rosto e pode perder volume com o tempo.",
    position: [-0.56, 0.44, 0.32],
    normal: [-0.8, 0.08, 0.35],
    cardSide: "left",
  },
  {
    id: "rightTemple",
    label: "Temporal direito",
    text: "A tempora participa da harmonia superior do rosto e pode perder volume com o tempo.",
    position: [0.56, 0.44, 0.32],
    normal: [0.8, 0.08, 0.35],
    cardSide: "right",
  },
];

type ModelFaceSceneProps = {
  regions: FaceRegion[];
  selectedRegion: FaceRegion | null;
  hoveredId: RegionId | null;
  tilt: PointerTilt;
  onHover: (id: RegionId | null) => void;
  onSelect: (id: RegionId) => void;
  onReady?: () => void;
  viewZoom: number;
  viewControl: ViewControl;
  resetSignal: number;
};

export function ModelFaceScene(props: ModelFaceSceneProps) {
  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-[#f6f1e8]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_56%_30%,rgba(136,216,192,.25),transparent_26%),radial-gradient(circle_at_42%_76%,rgba(240,122,136,.16),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(17,16,13,.05)_1px,transparent_1px),linear-gradient(180deg,rgba(17,16,13,.035)_1px,transparent_1px)] bg-size-[72px_72px] opacity-40" />

      <Canvas
        camera={{ position: [0, 0.1, 4.8], fov: 28 }}
        dpr={[1, 1.65]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
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

function SceneFallback() {
  return (
    <Html center>
      <div className="rounded-full border border-black/10 bg-[#fffaf0]/85 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black/55 shadow-xl backdrop-blur-md">
        Carregando modelo 3D
      </div>
    </Html>
  );
}

function CameraRig({
  selectedRegion,
  viewZoom,
}: {
  selectedRegion: FaceRegion | null;
  viewZoom: number;
}) {
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

function FaceRig({
  regions,
  selectedRegion,
  hoveredId,
  tilt,
  viewControl,
  resetSignal,
  onHover,
  onSelect,
  onReady,
}: ModelFaceSceneProps) {
  const rig = useRef<THREE.Group>(null);
  const modelSurface = useRef<THREE.Group>(null!);
  const readyAnnounced = useRef(false);
  const [activeLandmark, setActiveLandmark] = useState<LandmarkId | null>(null);
  const [hoveredLandmark, setHoveredLandmark] = useState<LandmarkId | null>(null);
  const model = faceModel;
  const { scene } = useGLTF(model.path);
  const clonedScene = useMemo(() => scene.clone(true), [scene]);
  const normalization = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const scale = model.targetHeight / Math.max(size.y, 0.001);

    return {
      center,
      scale,
    };
  }, [clonedScene, model.targetHeight]);
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
        materials.forEach((material) => {
          if ("roughness" in material) material.roughness = Math.min(Number(material.roughness ?? 0.55), 0.68);
          if ("metalness" in material) material.metalness = Math.min(Number(material.metalness ?? 0), 0.08);
        });
      }
    });

    if (!readyAnnounced.current) {
      readyAnnounced.current = true;
      requestAnimationFrame(() => onReady?.());
    }
  }, [clonedScene, onReady]);

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

  return (
    <group ref={rig}>
      <AnimateModelKey>
        <group
          ref={modelSurface}
          position={[0, model.verticalOffset, 0]}
          rotation={model.rotation}
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
      </AnimateModelKey>
      {regions.map((region) => (
        <FaceHotspot3D
          key={region.id}
          region={region}
          active={region.id === selectedRegion?.id}
          hovered={region.id === hoveredId}
          onHover={onHover}
          onSelect={(id) => {
            setActiveLandmark(null);
            onSelect(id);
          }}
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
          onSelect={(id) => {
            setActiveLandmark(id);
          }}
        />
      ))}
    </group>
  );
}

function AnimateModelKey({
  children,
}: {
  children: React.ReactNode;
}) {
  return <group>{children}</group>;
}

type InfoLandmark3DProps = {
  landmark: FaceLandmark;
  active: boolean;
  hovered: boolean;
  hasActiveLandmark: boolean;
  onHover: (id: LandmarkId | null) => void;
  onSelect: (id: LandmarkId) => void;
};

function InfoLandmark3D({
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

type FaceHotspot3DProps = {
  region: FaceRegion;
  active: boolean;
  hovered: boolean;
  onHover: (id: RegionId | null) => void;
  onSelect: (id: RegionId) => void;
};

function FaceHotspot3D({
  region,
  active,
  hovered,
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

  return (
    <group ref={ref} position={hotspotPositions[region.id]}>
      <mesh
        scale={hotspotScales[region.id]}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(region.id);
        }}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
      >
        <sphereGeometry args={[1, 32, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
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

