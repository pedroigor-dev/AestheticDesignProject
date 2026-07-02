import { RegionId } from "@/data/atlas";
import { CurvePath, FaceLandmark, ModelConfig, RegionPose } from "./scene-types";

export const faceModel: ModelConfig = {
  label: "Rosto",
  path: "/assets/maleface.glb",
  targetHeight: 2.12,
  verticalOffset: -0.1,
  rotation: [0, 0, 0],
};

export const hotspotPositions: Record<RegionId, [number, number, number]> = {
  scalp: [0, 0.82, 0.46],
  forehead: [0, 0.5, 0.62],
  eyes: [0, 0.2, 0.78],
  nose: [0, 0.03, 0.9],
  mouth: [0, -0.12, 0.86],
  jaw: [0, -0.42, 0.62],
};

export const hotspotScales: Record<RegionId, [number, number, number]> = {
  scalp: [0.42, 0.24, 0.18],
  forehead: [0.48, 0.22, 0.18],
  eyes: [0.72, 0.24, 0.2],
  nose: [0.28, 0.36, 0.2],
  mouth: [0.46, 0.2, 0.18],
  jaw: [0.62, 0.24, 0.2],
};

export const regionPoses: Record<RegionId, RegionPose> = {
  eyes: { yaw: 0.08, pitch: -0.02, zoom: 1.34, panX: 0.02, panY: 0.03 },
  nose: { yaw: -0.08, pitch: -0.01, zoom: 1.42, panX: 0, panY: 0 },
  mouth: { yaw: 0.05, pitch: 0.08, zoom: 1.42, panX: 0.01, panY: -0.06 },
  jaw: { yaw: -0.24, pitch: 0.1, zoom: 1.46, panX: -0.03, panY: -0.08 },
  forehead: { yaw: 0.1, pitch: -0.08, zoom: 1.38, panX: 0.01, panY: 0.08 },
  scalp: { yaw: 0.15, pitch: -0.12, zoom: 1.3, panX: 0.02, panY: 0.12 },
};

export const faceLandmarks: FaceLandmark[] = [
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

export const anatomyCurves: CurvePath[] = [
  {
    id: "jawline",
    color: "#9cb7ff",
    opacity: 0.62,
    radius: 0.012,
    points: [
      [-0.58, -0.32, 0.58],
      [-0.34, -0.47, 0.72],
      [0, -0.52, 0.78],
      [0.34, -0.47, 0.72],
      [0.58, -0.32, 0.58],
    ],
  },
  {
    id: "nasal-cartilage",
    color: "#f3b36f",
    opacity: 0.72,
    radius: 0.009,
    points: [
      [0, 0.23, 0.83],
      [0, 0.1, 0.95],
      [0, -0.04, 0.99],
      [0, -0.11, 0.92],
    ],
  },
  {
    id: "brow-line",
    color: "#d6c57a",
    opacity: 0.52,
    radius: 0.008,
    points: [
      [-0.46, 0.34, 0.73],
      [-0.2, 0.38, 0.79],
      [0, 0.39, 0.8],
      [0.2, 0.38, 0.79],
      [0.46, 0.34, 0.73],
    ],
  },
];

export const vesselCurves: CurvePath[] = [
  {
    id: "left-facial-artery",
    color: "#e65555",
    opacity: 0.82,
    radius: 0.01,
    points: [
      [-0.43, -0.42, 0.52],
      [-0.35, -0.2, 0.66],
      [-0.28, -0.02, 0.74],
      [-0.21, 0.15, 0.79],
      [-0.12, 0.27, 0.83],
    ],
  },
  {
    id: "right-facial-artery",
    color: "#e65555",
    opacity: 0.82,
    radius: 0.01,
    points: [
      [0.43, -0.42, 0.52],
      [0.35, -0.2, 0.66],
      [0.28, -0.02, 0.74],
      [0.21, 0.15, 0.79],
      [0.12, 0.27, 0.83],
    ],
  },
  {
    id: "left-temporal-vessel",
    color: "#79c7e8",
    opacity: 0.74,
    radius: 0.008,
    points: [
      [-0.47, 0.2, 0.52],
      [-0.56, 0.36, 0.42],
      [-0.58, 0.56, 0.34],
      [-0.48, 0.73, 0.28],
    ],
  },
  {
    id: "right-temporal-vessel",
    color: "#79c7e8",
    opacity: 0.74,
    radius: 0.008,
    points: [
      [0.47, 0.2, 0.52],
      [0.56, 0.36, 0.42],
      [0.58, 0.56, 0.34],
      [0.48, 0.73, 0.28],
    ],
  },
];
