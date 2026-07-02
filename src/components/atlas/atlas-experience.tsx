"use client";

import { AnimatePresence, motion, useReducedMotion, Variants } from "framer-motion";
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

const stageVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
  exit: {
    opacity: [1, 1, 0],
    transition: { duration: 0.95, times: [0, 0.8, 1], staggerChildren: 0.03 },
  },
};

const sceneVariants: Variants = {
  hidden: { opacity: 0, scale: 0.22, z: -1100, rotateX: 12, filter: "blur(20px)" },
  visible: {
    opacity: 1,
    scale: [0.22, 1.08, 1],
    z: [-1100, 30, 0],
    rotateX: [12, -3, 0],
    filter: ["blur(20px)", "blur(3px)", "blur(0px)"],
    transition: { duration: 0.86, times: [0, 0.55, 1], ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    scale: [1, 1.12, 7.5],
    z: [0, 20, 2600],
    filter: ["blur(0px)", "blur(0px)", "blur(50px)"],
    opacity: [1, 1, 0],
    transition: { duration: 0.95, times: [0, 0.18, 1], ease: [0.6, 0, 0.85, 0.2] },
  },
};

const ringVariants: Variants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: [0, 0.8, 0],
    scale: [0.4, 2.2, 2.4],
    transition: { duration: 0.68, delay: 0.48, ease: "easeOut" },
  },
  exit: { opacity: 0 },
};

const flashVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 0.2, 0],
    transition: { duration: 0.38, delay: 0.46, times: [0, 0.45, 1] },
  },
  exit: {
    opacity: [0, 0.32, 0],
    transition: { duration: 0.42, delay: 0.26, times: [0, 0.5, 1] },
  },
};

const hudVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, delay: 0.52, ease: [0.22, 1, 0.36, 1] },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.26, ease: "easeIn" } },
};

const reducedSceneVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const reducedHudVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, delay: 0.15 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const hiddenVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 0 },
  exit: { opacity: 0 },
};

function useLoadProgress(ready: boolean) {
  const [percent, setPercent] = useState(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const bump = window.setInterval(() => {
      targetRef.current = ready
        ? 100
        : Math.min(95, targetRef.current + (Math.random() * 1.6 + 0.4));
    }, 70);

    const tick = () => {
      setPercent((current) => {
        const next = current + (targetRef.current - current) * 0.12;
        return ready && next > 99.3 ? 100 : next;
      });
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.clearInterval(bump);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, [ready]);

  return Math.round(percent);
}

const NODES = [
  { cx: 47, cy: 97, delay: "0.55s, 0.95s" },
  { cx: 153, cy: 97, delay: "0.55s, 0.95s" },
  { cx: 47, cy: 151, delay: "0.68s, 1.35s" },
  { cx: 153, cy: 151, delay: "0.68s, 1.35s" },
];

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
function FacialBlueprint({ reduceMotion }: { reduceMotion: boolean }) {
  const drawn = reduceMotion;

  return (
    <div className="relative h-48 w-40">
      <style>{`
        @keyframes node-in{ to{ opacity:1; } }
        @keyframes node-pulse{ 0%,100%{ transform:scale(1); opacity:.85; } 50%{ transform:scale(1.6); opacity:.25; } }
        @keyframes scan-sweep{
          0%   { transform:translateY(36px); opacity:0; }
          8%   { opacity:.5; }
          48%  { transform:translateY(160px); opacity:.5; }
          58%  { opacity:0; }
          100% { opacity:0; transform:translateY(36px); }
        }
      `}</style>

      <svg viewBox="0 0 200 240" className="h-full w-full text-[#88d8c0]" fill="none">
        <motion.ellipse
          cx={100}
          cy={124}
          rx={56}
          ry={80}
          stroke="currentColor"
          strokeWidth={1.4}
          initial={drawn ? { pathLength: 1, opacity: 0.7 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.7 }}
          transition={drawn ? { duration: 0 } : { duration: 0.85, delay: 0.08, ease: [0.65, 0, 0.35, 1] }}
        />

        <motion.line
          x1={100}
          y1={18}
          x2={100}
          y2={230}
          stroke="currentColor"
          strokeWidth={1}
          initial={drawn ? { pathLength: 1, opacity: 0.4 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.4 }}
          transition={drawn ? { duration: 0 } : { duration: 0.85, delay: 0.22, ease: [0.65, 0, 0.35, 1] }}
        />
        <line x1={94} y1={18} x2={106} y2={18} stroke="currentColor" strokeWidth={1} opacity={0.4} />
        <line x1={94} y1={230} x2={106} y2={230} stroke="currentColor" strokeWidth={1} opacity={0.4} />

        <motion.line
          x1={40}
          y1={97}
          x2={160}
          y2={97}
          stroke="currentColor"
          strokeWidth={1}
          initial={drawn ? { pathLength: 1, opacity: 0.45 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.45 }}
          transition={drawn ? { duration: 0 } : { duration: 0.7, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
        />
        <motion.line
          x1={40}
          y1={151}
          x2={160}
          y2={151}
          stroke="currentColor"
          strokeWidth={1}
          initial={drawn ? { pathLength: 1, opacity: 0.45 } : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.45 }}
          transition={drawn ? { duration: 0 } : { duration: 0.7, delay: 0.38, ease: [0.65, 0, 0.35, 1] }}
        />

        <line x1={40} y1={92} x2={40} y2={102} stroke="currentColor" strokeWidth={1} opacity={0.4} />
        <line x1={160} y1={92} x2={160} y2={102} stroke="currentColor" strokeWidth={1} opacity={0.4} />
        <line x1={40} y1={146} x2={40} y2={156} stroke="currentColor" strokeWidth={1} opacity={0.4} />
        <line x1={160} y1={146} x2={160} y2={156} stroke="currentColor" strokeWidth={1} opacity={0.4} />

        {NODES.map((node, i) => (
          <circle
            key={i}
            cx={node.cx}
            cy={node.cy}
            r={2.6}
            fill="currentColor"
            style={
              reduceMotion
                ? { opacity: 0.85 }
                : {
                    opacity: 0,
                    animation: "node-in .4s ease-out forwards, node-pulse 2.6s ease-in-out infinite",
                    animationDelay: node.delay,
                  }
            }
          />
        ))}
      </svg>

      {!reduceMotion && (
        <div
          className="absolute left-[18px] h-[2px] w-[124px] rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent, #88d8c0, transparent)",
            boxShadow: "0 0 10px rgba(136,216,192,.6)",
            animation: "scan-sweep 4.2s linear .9s infinite",
          }}
        />
      )}
    </div>
  );
}

export function AtlasIntroLoader({ ready }: { ready: boolean }) {
  const percent = useLoadProgress(ready);
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center overflow-hidden bg-[#100f0c]"
      style={{ perspective: reduceMotion ? undefined : 1400 }}
      variants={stageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,250,240,.05)_1px,transparent_1px),linear-gradient(180deg,rgba(255,250,240,.04)_1px,transparent_1px)] bg-size-[84px_84px] opacity-50" />
      <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,.05)_1px,transparent_1px)] bg-size-[3px_3px] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_48%,transparent_34%,rgba(16,15,12,.88)_100%)]" />

      <motion.div
        className="pointer-events-none absolute inset-0 bg-[#fffaf0]"
        variants={reduceMotion ? hiddenVariants : flashVariants}
      />

      <motion.div
        className="relative flex flex-col items-center"
        style={{ transformStyle: reduceMotion ? undefined : "preserve-3d" }}
        variants={reduceMotion ? reducedSceneVariants : sceneVariants}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#88d8c0]/50"
          variants={reduceMotion ? hiddenVariants : ringVariants}
        />
        <FacialBlueprint reduceMotion={!!reduceMotion} />
        <p className="mt-3.5 text-sm font-medium uppercase tracking-[0.34em] text-[#fffaf0]/85">
          Atlas
        </p>
      </motion.div>

      <motion.div
        className="absolute bottom-[14%] flex flex-col items-center text-center"
        variants={reduceMotion ? reducedHudVariants : hudVariants}
      >
        <div className="mb-3.5 h-px w-36 bg-linear-to-r from-transparent via-[#88d8c0] to-transparent" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-[#88d8c0]/85">
          Lendo proporcoes faciais
        </p>
        <div className="mt-7 flex flex-col items-center gap-2.5">
          <span className="font-mono text-[13px] font-semibold tracking-[0.08em] text-[#fffaf0]/60 tabular-nums">
            {percent.toString().padStart(2, "0")}%
          </span>
          <div className="h-[1.5px] w-50 overflow-hidden rounded-full bg-[#fffaf0]/12">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#88d8c0] to-[#fffaf0] transition-[width] duration-150"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function AtlasIntroLoaderWrapper({ show, ready }: { show: boolean; ready: boolean }) {
  return <AnimatePresence>{show && <AtlasIntroLoader ready={ready} />}</AnimatePresence>;
}
