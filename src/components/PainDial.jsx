import { useRef, useCallback, useEffect } from "react";

/* ─── Web Audio tick sound ─── */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTick(intensity) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 220 + (intensity / 10) * 660; // 220 Hz → 880 Hz
    osc.type = "sine";
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    /* silent fallback */
  }
}

/* ─── Color grading (matches original) ─── */
export function intensityToColor(intensity) {
  // 0 = green (#4ade80), 5 = yellow (#facc15), 10 = red (#ef4444)
  const t = intensity / 10;
  if (t <= 0.5) {
    // green → yellow
    const p = t * 2;
    const r = Math.round(74 + (250 - 74) * p);
    const g = Math.round(222 + (204 - 222) * p);
    const b = Math.round(128 + (21 - 128) * p);
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // yellow → red
    const p = (t - 0.5) * 2;
    const r = Math.round(250 + (239 - 250) * p);
    const g = Math.round(204 + (68 - 204) * p);
    const b = Math.round(21 + (68 - 21) * p);
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/* ─── Tick marks helper ─── */
function TickMarks({ cx, cy, radius, count, intensity }) {
  const ticks = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 360 - 90;
    const rad = (angle * Math.PI) / 180;
    const innerR = radius - 4;
    const outerR = radius + 1;
    const x1 = cx + innerR * Math.cos(rad);
    const y1 = cy + innerR * Math.sin(rad);
    const x2 = cx + outerR * Math.cos(rad);
    const y2 = cy + outerR * Math.sin(rad);
    const active = i <= (intensity / 10) * count;
    ticks.push(
      <line
        key={i}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={active ? intensityToColor(intensity) : "rgba(255,255,255,0.15)"}
        strokeWidth="1"
        strokeLinecap="round"
      />
    );
  }
  return <>{ticks}</>;
}

/* ─── PainDial component ─── */
export default function PainDial({ point, onIntensityChange, onConfirm, onRemove }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const lastVal = useRef(point.intensity);

  const { x, y, intensity, bodyPart } = point;
  const color = intensityToColor(intensity);

  // Dial geometry
  const cx = 50, cy = 50, radius = 36;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (intensity / 10) * circumference;

  const getAngleFromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const cxP = rect.left + rect.width / 2;
    const cyP = rect.top + rect.height / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    let angle = Math.atan2(clientY - cyP, clientX - cxP) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;
    return Math.round(Math.min(10, Math.max(0, (angle / 360) * 10)));
  }, []);

  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    const val = getAngleFromEvent(e);
    if (val !== lastVal.current) {
      playTick(val);
      lastVal.current = val;
    }
    onIntensityChange(val);
  }, [getAngleFromEvent, onIntensityChange]);

  const handlePointerMove = useCallback((e) => {
    if (!dragging.current) return;
    e.preventDefault();
    const val = getAngleFromEvent(e);
    if (val !== lastVal.current) {
      playTick(val);
      lastVal.current = val;
    }
    onIntensityChange(val);
  }, [getAngleFromEvent, onIntensityChange]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // Global pointer events for dragging
  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  return (
    <div
      ref={containerRef}
      className="pain-dial absolute z-50 flex items-center justify-center"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        width: "110px",
        height: "110px",
      }}
    >
      <svg
        ref={svgRef}
        className="h-[100px] w-[100px] cursor-grab active:cursor-grabbing"
        viewBox="0 0 100 100"
        onPointerDown={handlePointerDown}
      >
        {/* Glow filter */}
        <defs>
          <filter id="dialGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dark center knob */}
        <circle cx={cx} cy={cy} r={radius - 10} fill="rgba(15,15,20,0.9)" />

        {/* Tick marks */}
        <TickMarks cx={cx} cy={cy} radius={radius} count={40} intensity={intensity} />

        {/* Background track */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none" stroke="rgba(255,255,255,0.08)"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none" stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference - progress}`}
          strokeDashoffset={circumference * 0.25}
          filter="url(#dialGlow)"
          style={{ transition: dragging.current ? "none" : "stroke-dasharray 0.15s ease" }}
        />

        {/* Center value */}
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="central"
          fill={color} fontSize="20" fontWeight="700"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {intensity}
        </text>
      </svg>
      {/* Body part label */}
      {bodyPart && (
        <div
          className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                     rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/80
                     backdrop-blur-sm"
        >
          {bodyPart}
        </div>
      )}
    </div>
  );
}
