"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, RotateCcw } from "lucide-react";
import {
  PointerEvent,
  WheelEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AtlasMode,
  ModelFaceScene,
  ViewControl,
} from "@/components/atlas/model-face-scene";
import { RegionCallouts } from "@/components/atlas/region-callouts";
import { RegionDock } from "@/components/atlas/region-dock";
import { RegionPanel } from "@/components/atlas/region-panel";
import { useAtlasSelection } from "@/hooks/use-atlas-selection";
import { usePointerTilt } from "@/hooks/use-pointer-tilt";
import { RegionId } from "@/data/atlas";

const atlasModes: Array<{ id: AtlasMode; label: string }> = [
  { id: "aesthetic", label: "Estetica" },
  { id: "anatomy", label: "Anatomia" },
  { id: "muscles", label: "Musculos" },
  { id: "vessels", label: "Vasos" },
];

/** Diagrama minimalista de proporcao facial: contorno, eixo de simetria,
 *  linhas de "tercos" e pontos de referencia — em vez de uma mira/reticula. */
export function AtlasExperience() {
  const { regions, selectedId, selectedRegion, selectRegion } = useAtlasSelection();
  const [hoveredId, setHoveredId] = useState<RegionId | null>(null);
  const [atlasMode, setAtlasMode] = useState<AtlasMode>("aesthetic");
  const [viewZoom, setViewZoom] = useState(0.9);
  const [isDragging, setIsDragging] = useState(false);
  const [isModelReady, setIsModelReady] = useState(false);
  const [introElapsed, setIntroElapsed] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [viewControl, setViewControl] = useState<ViewControl>({
    yaw: 0,
    pitch: 0,
    panX: 0,
    panY: 0,
  });
  const dragPoint = useRef({ x: 0, y: 0 });
  const dragOrigin = useRef({ x: 0, y: 0 });
  const isPointerDown = useRef(false);
  const { tilt, handlePointerMove, resetTilt } = usePointerTilt();
  const showIntro = !introElapsed;

  useEffect(() => {
    const timer = window.setTimeout(() => setIntroElapsed(true), 1850);
    const readyFallback = window.setTimeout(() => setIsModelReady(true), 4200);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(readyFallback);
    };
  }, []);

  const handleModelReady = useCallback(() => {
    setIsModelReady(true);
  }, []);

  const handleSelectRegion = useCallback(
    (id: RegionId) => {
      setViewZoom(1.12);
      setViewControl({
        yaw: 0,
        pitch: 0,
        panX: 0,
        panY: 0,
      });
      selectRegion(id);
    },
    [selectRegion],
  );

  const handleWheel = useCallback((event: WheelEvent<HTMLElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.06 : 0.06;
    setViewZoom((current) =>
      Number(Math.min(1.22, Math.max(0.72, current + delta)).toFixed(2)),
    );
  }, []);

  const handleResetView = useCallback(() => {
    selectRegion(null);
    setHoveredId(null);
    setViewZoom(0.9);
    setViewControl({
      yaw: 0,
      pitch: 0,
      panX: 0,
      panY: 0,
    });
    resetTilt();
    setResetSignal((current) => current + 1);
  }, [resetTilt, selectRegion]);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("button, nav, aside, [data-scene-ui]")) return;

    isPointerDown.current = true;
    dragPoint.current = { x: event.clientX, y: event.clientY };
    dragOrigin.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handleScenePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      handlePointerMove(event);
      if (!isPointerDown.current) return;

      const dx = event.clientX - dragPoint.current.x;
      const dy = event.clientY - dragPoint.current.y;
      const totalDx = event.clientX - dragOrigin.current.x;
      const totalDy = event.clientY - dragOrigin.current.y;
      const hasDragged = Math.hypot(totalDx, totalDy) > 4;
      if (!isDragging && !hasDragged) return;

      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
      if (!isDragging) setIsDragging(true);
      dragPoint.current = { x: event.clientX, y: event.clientY };

      setViewControl((current) => ({
        yaw: Math.min(1.05, Math.max(-1.05, current.yaw + dx * 0.0045)),
        pitch: Math.min(0.32, Math.max(-0.32, current.pitch + dy * 0.0018)),
        panX: Math.min(0.48, Math.max(-0.48, current.panX + dx * 0.0012)),
        panY: Math.min(0.42, Math.max(-0.42, current.panY - dy * 0.0014)),
      }));
    },
    [handlePointerMove, isDragging],
  );

  const stopDragging = useCallback(() => {
    isPointerDown.current = false;
    setIsDragging(false);
  }, []);

  return (
    <section className="relative flex h-[100svh] flex-col overflow-hidden lg:flex-row">
      <div
        className={`relative min-h-0 flex-1 overflow-hidden ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handleScenePointerMove}
        onPointerUp={stopDragging}
        onPointerCancel={stopDragging}
        onPointerLeave={(event) => {
          resetTilt();
          stopDragging();
          if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
          }
        }}
        onWheel={handleWheel}
      >
        <Header />

        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <ModelFaceScene
            regions={regions}
            selectedRegion={selectedRegion}
            hoveredId={hoveredId}
            tilt={tilt}
            viewZoom={viewZoom}
            viewControl={viewControl}
            resetSignal={resetSignal}
            atlasMode={atlasMode}
            onHover={setHoveredId}
            onSelect={handleSelectRegion}
            onReady={handleModelReady}
          />
        </motion.div>

        <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-linear-to-b from-[#f7f4ed] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-[#f7f4ed]/90 to-transparent" />
        <RegionCallouts region={selectedRegion} />
        <ZoomPill zoom={viewZoom} />
        <ResetButton onReset={handleResetView} />
        <ModeSwitcher mode={atlasMode} onChange={setAtlasMode} />
        <RegionDock regions={regions} selectedId={selectedId} onSelect={handleSelectRegion} />
      </div>

      <RegionPanel region={selectedRegion} />
      <AtlasIntroLoaderWrapper show={showIntro} ready={isModelReady || introElapsed} />
    </section>
  );
}

function ModeSwitcher({
  mode,
  onChange,
}: {
  mode: AtlasMode;
  onChange: (mode: AtlasMode) => void;
}) {
  return (
    <div
      data-scene-ui
      className="absolute left-1/2 top-[86px] z-30 hidden -translate-x-1/2 rounded-full border border-black/10 bg-[#fffaf0]/78 p-1 shadow-2xl shadow-black/8 backdrop-blur-xl md:flex lg:top-7"
      aria-label="Modo de visualizacao"
      role="group"
    >
      {atlasModes.map((item) => {
        const active = item.id === mode;

        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={`h-9 rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
              active
                ? "bg-[#14110e] text-[#fffaf0] shadow-lg shadow-black/15"
                : "text-black/45 hover:bg-white/70 hover:text-black/70"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      data-scene-ui
      aria-label="Resetar camera"
      title="Resetar camera"
      onClick={onReset}
      className="absolute left-4 top-32 z-30 grid size-10 place-items-center rounded-full border border-black/10 bg-[#fffaf0]/78 text-black/52 shadow-xl shadow-black/5 backdrop-blur-xl transition hover:scale-105 hover:bg-white hover:text-black/72 focus:outline-none focus:ring-2 focus:ring-[#88d8c0]/55 lg:left-8 lg:top-[136px]"
    >
      <RotateCcw className="size-4" />
    </button>
  );
}

function ZoomPill({ zoom }: { zoom: number }) {
  return (
    <div className="absolute left-4 top-20 z-30 hidden rounded-full border border-black/10 bg-[#fffaf0]/78 px-3 py-2 text-xs font-medium text-black/48 shadow-xl shadow-black/5 backdrop-blur-xl md:block lg:left-8">
      Scroll para zoom - {Math.round(zoom * 100)}%
    </div>
  );
}

function Header() {
  return (
    <header className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between gap-4 lg:left-8 lg:right-[430px] lg:top-7">
      <h1 className="sr-only">Face Atlas</h1>
      <div className="flex h-11 items-center gap-2 rounded-full border border-black/10 bg-[#fffaf0]/74 px-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/48 shadow-xl shadow-black/5 backdrop-blur-xl">
        <Activity className="size-3.5" />
        Atlas estetico
      </div>
    </header>
  );
}

export function AtlasIntroLoader({ ready }: { ready: boolean }) {
  return (
    <motion.div
      className="fixed inset-0 z-[2147483647] grid place-items-center overflow-hidden bg-[#f6f1e8]"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.28, ease: "easeOut" } }}
      aria-busy={!ready}
      aria-label="Carregando atlas"
    >
      <style>{`
        .atlas-loading svg polyline {
          fill: none;
          stroke-width: 3;
          stroke-linecap: round;
          stroke-linejoin: round;
        }

        .atlas-loading svg polyline#back {
          stroke: #ff4d5033;
        }

        .atlas-loading svg polyline#front {
          stroke: #ff4d4f;
          stroke-dasharray: 48, 144;
          stroke-dashoffset: 192;
          animation: atlas-dash 1.4s linear infinite;
        }

        @keyframes atlas-dash {
          72.5% {
            opacity: 0;
          }

          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      <motion.div
        className="atlas-loading"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <svg width="64px" height="48px" viewBox="0 0 64 48" role="img" aria-hidden="true">
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="back"
          />
          <polyline
            points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
            id="front"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}

export function AtlasIntroLoaderWrapper({ show, ready }: { show: boolean; ready: boolean }) {
  return <AnimatePresence>{show && <AtlasIntroLoader ready={ready} />}</AnimatePresence>;
}
