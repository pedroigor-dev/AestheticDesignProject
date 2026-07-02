import { FaceRegion, RegionId } from "@/data/atlas";
import { PointerTilt } from "@/hooks/use-pointer-tilt";

export type AtlasMode = "aesthetic" | "anatomy" | "muscles" | "vessels";

export type ViewControl = {
  yaw: number;
  pitch: number;
  panX: number;
  panY: number;
};

export type ModelConfig = {
  label: string;
  path: string;
  targetHeight: number;
  verticalOffset: number;
  rotation: [number, number, number];
};

export type RegionPose = {
  yaw: number;
  pitch: number;
  zoom: number;
  panX: number;
  panY: number;
};

export type LandmarkId =
  | "leftEar"
  | "rightEar"
  | "leftZygoma"
  | "rightZygoma"
  | "leftMandibularAngle"
  | "rightMandibularAngle"
  | "leftTemple"
  | "rightTemple";

export type FaceLandmark = {
  id: LandmarkId;
  label: string;
  text: string;
  position: [number, number, number];
  normal: [number, number, number];
  cardSide: "left" | "right";
};

export type CurvePath = {
  id: string;
  color: string;
  opacity: number;
  radius: number;
  points: [number, number, number][];
};

export type ModelFaceSceneProps = {
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
  atlasMode: AtlasMode;
};
