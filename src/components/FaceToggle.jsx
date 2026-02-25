import { useRef, useCallback, useEffect, useState } from "react";
import { interpolate } from "flubber";

/* ── Web Audio "aw" placeholder (sine sweep) ── */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTick(intensity) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    // Lower pitch at low pain, higher at high pain (voice "aw" placeholder)
    osc.frequency.value = 180 + (intensity / 10) * 400;
    osc.type = "sine";
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  } catch { /* silent fallback */ }
}

/* ── 6 face states: green → lime → yellow → gold → orange → red ── */
const faces = [
  { color:[60,140,77],
    leftEye:'M28 33C24.687 33 22 35.686 22 39H34C34 35.686 31.313 33 28 33Z',
    rightEye:'M62 33C58.687 33 56 35.686 56 39H68C68 35.686 65.313 33 62 33Z',
    mouth:'M34 56C34 62.075 38.925 67 45 67C51.075 67 56 62.075 56 56H34Z' },
  { color:[142,186,63],
    leftEye:'M28 45C24.687 45 22 42.314 22 39C22 35.686 24.687 33 28 33C31.313 33 34 35.686 34 39C34 42.314 31.313 45 28 45Z',
    rightEye:'M62 45C58.687 45 56 42.314 56 39C56 35.686 58.687 33 62 33C65.313 33 68 35.686 68 39C68 42.314 65.313 45 62 45Z',
    mouth:'M34 56C34 62.075 38.925 67 45 67C51.075 67 56 62.075 56 56H34Z' },
  { color:[234,235,46],
    leftEye:'M28 45C24.687 45 22 42.314 22 39C22 35.686 24.687 33 28 33C31.313 33 34 35.686 34 39C34 42.314 31.313 45 28 45Z',
    rightEye:'M62 45C58.687 45 56 42.314 56 39C56 35.686 58.687 33 62 33C65.313 33 68 35.686 68 39C68 42.314 65.313 45 62 45Z',
    mouth:'M35 60H55V64H35V60Z' },
  { color:[228,171,29],
    leftEye:'M28 33C24.687 33 22 35.686 22 39H34C34 35.686 31.313 33 28 33Z',
    rightEye:'M62 33C58.687 33 56 35.686 56 39H68C68 35.686 65.313 33 62 33Z',
    mouth:'M35 60H55V64H35V60Z' },
  { color:[230,118,14],
    leftEye:'M28 45C24.687 45 22 42.314 22 39H34C34 42.314 31.313 45 28 45Z',
    rightEye:'M62 45C58.687 45 56 42.314 56 39H68C68 42.314 65.313 45 62 45Z',
    mouth:'M34 67C34 60.925 38.925 56 45 56C51.075 56 56 60.925 56 67H34Z' },
  { color:[201,17,17],
    leftEye:'M27.657 41.485L24.829 44.314L22 41.485L24.829 38.656L22 35.829L24.829 33L27.657 35.829L30.485 33L33.313 35.829L30.485 38.657L33.313 41.486L30.485 44.315Z',
    rightEye:'M67.656 41.829L64.828 44.657L62 41.829L59.172 44.657L56.344 41.829L59.172 39L56.344 36.171L59.172 33.343L62 36.171L64.828 33.343L67.656 36.171L64.828 39Z',
    mouth:'M60 64H56V68H52V64H48V68H44V64H40V68H36V64H32V60H36V56H40V60H44V56H48V60H52V56H56V60H60V64Z' }
];

/* ── Pre-compute Flubber morph interpolators ── */
const opts = { maxSegmentLength: 1 };
const interps = faces.slice(0, -1).map((f, i) => ({
  leftEye:  interpolate(f.leftEye,  faces[i+1].leftEye,  opts),
  rightEye: interpolate(f.rightEye, faces[i+1].rightEye, opts),
  mouth:    interpolate(f.mouth,    faces[i+1].mouth,    opts),
}));

/* ── Helpers ── */
function lerp3(a, b, t) {
  return [Math.round(a[0]+(b[0]-a[0])*t), Math.round(a[1]+(b[1]-a[1])*t), Math.round(a[2]+(b[2]-a[2])*t)];
}
function rgb(c) { return `rgb(${c[0]},${c[1]},${c[2]})`; }

function getFaceState(p) {
  p = Math.max(1, Math.min(10, p));
  const fi = (p - 1) * 5 / 9;
  const idx = Math.min(Math.floor(fi), faces.length - 2);
  const t = Math.min(fi - idx, 1);
  const from = faces[idx], to = faces[Math.min(idx+1, faces.length-1)];
  const col = lerp3(from.color, to.color, t);
  if (t < 0.001 || idx >= interps.length) {
    return { col, leftEye: from.leftEye, rightEye: from.rightEye, mouth: from.mouth };
  }
  return {
    col,
    leftEye: interps[idx].leftEye(t),
    rightEye: interps[idx].rightEye(t),
    mouth: interps[idx].mouth(t),
  };
}

/* Re-export for confirmed point markers */
export function intensityToColor(intensity) {
  const face = getFaceState(Math.max(1, intensity));
  return rgb(face.col);
}

/* ── Dial Geometry (Figma-matched from dial.html) ── */
const CX = 270, CY = 270;   // face center = pivot
const FR = 65;                // face radius
const OR = 168;               // orbit radius (face → number)
const NR = 40;                // number circle radius
const FSCALE = (FR * 2) / 90; // ≈ 1.444 — maps 90×90 face paths into 130px diameter

/* ── Angle ↔ Pain mapping ── */
function painToAngle(p) { return Math.max(0, p - 1) * 36; }
function angleToPain(a) {
  a = ((a % 360) + 360) % 360;
  if (a > 342) return 10;
  return Math.min(10, Math.max(1, Math.round(a / 36 + 1)));
}

/* ══════════════════════════════════════════════════════
   FaceToggle — Rotating pill dial (toggle-button sized)
   ══════════════════════════════════════════════════════ */
export default function FaceToggle({ point, onIntensityChange, onConfirm, onRemove }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const lastVal = useRef(point.intensity);

  const intensity = point.intensity;

  /* Play tick sound on value change */
  useEffect(() => {
    if (intensity !== lastVal.current) {
      playTick(intensity);
      lastVal.current = intensity;
    }
  }, [intensity]);
  const face = getFaceState(Math.max(1, intensity));
  const faceColor = rgb(face.col);

  /* Rotation angle */
  const deg = painToAngle(intensity);
  const rad = (deg * Math.PI) / 180;

  /* Number bubble position (stays upright while pill rotates) */
  const nx = CX + Math.sin(rad) * OR;
  const ny = CY - Math.cos(rad) * OR;

  /* ── Pointer → angle → pain value ── */
  const getAngleFromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const ex = clientX - rect.left - rect.width / 2;
    const ey = clientY - rect.top - rect.height / 2;
    let a = Math.atan2(ex, -ey) * (180 / Math.PI);
    return a < 0 ? a + 360 : a;
  }, []);

  const handleDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    onIntensityChange(angleToPain(getAngleFromEvent(e)));
  }, [getAngleFromEvent, onIntensityChange]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      e.preventDefault();
      onIntensityChange(angleToPain(getAngleFromEvent(e)));
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [getAngleFromEvent, onIntensityChange]);

  return (
    <div
      className="pain-dial absolute z-50 flex items-center justify-center
                 h-[90px] w-[90px] md:h-[225px] md:w-[225px]"
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 540 540"
        className="h-full w-full cursor-grab active:cursor-grabbing"
        style={{ overflow: "visible", filter: "drop-shadow(0 3px 8px rgba(0,0,0,0.45))" }}
        onPointerDown={handleDown}
      >
        <defs>
          {/* Fixed-position radial gradient — lighting stays consistent as pill rotates */}
          <radialGradient id="ftPillGrad" cx="270" cy="210" r="280" gradientUnits="userSpaceOnUse">
            <stop offset="0%"  stopColor="#D0D0D0" />
            <stop offset="100%" stopColor="#C2C2C2" />
          </radialGradient>
        </defs>

        {/* ═══ ROTATING ARM: pill capsule + number circle ═══ */}
        <g transform={`rotate(${deg}, ${CX}, ${CY})`}>
          <rect x="181" y="12" width="178" height="354" rx="89" fill="url(#ftPillGrad)" />
          <circle cx={CX} cy={CY - OR} r={NR} fill="#E5E5E5" stroke="#555" strokeWidth="2" />
        </g>

        {/* ═══ FACE (fixed center, always upright) ═══ */}
        <circle cx={CX} cy={CY} r={FR} fill={faceColor} />
        <g transform={`translate(${CX - FR}, ${CY - FR}) scale(${FSCALE})`}>
          <path fill="rgba(0,0,0,0.65)" d={face.leftEye} />
          <path fill="rgba(0,0,0,0.65)" d={face.rightEye} />
          <path fill="rgba(0,0,0,0.65)" d={face.mouth} />
        </g>

        {/* ═══ NUMBER TEXT (always upright, follows orbit position) ═══ */}
        <text
          x={nx} y={ny}
          textAnchor="middle" dominantBaseline="central"
          fontFamily="'Helvetica Neue',Helvetica,Arial,sans-serif"
          fontWeight="500"
          fontSize={intensity >= 10 ? 22 : 26}
          fill="#000"
          style={{ userSelect: "none", pointerEvents: "none" }}
        >
          {intensity}
        </text>
      </svg>

      {/* Body part label */}
      {point.bodyPart && (
        <div
          className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap
                     rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white/80
                     backdrop-blur-sm"
        >
          {point.bodyPart}
        </div>
      )}
    </div>
  );
}
