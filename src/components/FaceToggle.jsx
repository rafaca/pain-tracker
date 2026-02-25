import { useRef, useCallback, useEffect, useMemo } from "react";
import { interpolate } from "flubber";

/* ── 6 face states: green→lime→yellow→gold→orange→red ── */
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

/* ── Toggle Geometry ── */
const W = 240, H = 100, R = H / 2;  // track: 240×100, fully rounded
const TR = 42;                        // thumb radius
const XMIN = R;                       // leftmost thumb cx (pain 0)
const XMAX = W - R;                   // rightmost thumb cx (pain 10)

function valToX(v) { return XMIN + (v / 10) * (XMAX - XMIN); }
function xToVal(x) { return Math.max(0, Math.min(10, Math.round(((x - XMIN) / (XMAX - XMIN)) * 10))); }

/* ══════════════════════════════════════════
   FaceToggle — iOS-toggle-sized pain dial
   ══════════════════════════════════════════ */
export default function FaceToggle({ point, onIntensityChange, onConfirm, onRemove }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const intensity = point.intensity;
  const thumbX = valToX(intensity);
  const face = getFaceState(Math.max(1, intensity));
  const faceColor = rgb(face.col);

  /* Scale: map 90×90 face paths into 2×TR diameter circle */
  const fScale = (TR * 2) / 90;

  /* ── Pointer → value ── */
  const getValFromEvent = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return intensity;
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const svgX = ((clientX - rect.left) / rect.width) * W;
    return xToVal(svgX);
  }, [intensity]);

  const handleDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    const val = getValFromEvent(e);
    onIntensityChange(val);
  }, [getValFromEvent, onIntensityChange]);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      e.preventDefault();
      onIntensityChange(getValFromEvent(e));
    };
    const onUp = () => { dragging.current = false; };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [getValFromEvent, onIntensityChange]);

  return (
    <div
      className="pain-dial absolute z-50 flex flex-col items-center"
      style={{
        left: `${point.x}%`,
        top: `${point.y}%`,
        transform: "translate(-50%, -50%)",
        width: "160px",
      }}
    >
      {/* ── SVG toggle ── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.4))" }}
        onPointerDown={handleDown}
      >
        <defs>
          <clipPath id="trackClip">
            <rect x="0" y="0" width={W} height={H} rx={R} />
          </clipPath>
        </defs>

        {/* Track background */}
        <rect x="0" y="0" width={W} height={H} rx={R}
              fill="rgba(60,60,70,0.95)" />

        {/* Active fill (left of thumb) */}
        <rect x="0" y="0" width={thumbX} height={H}
              fill={faceColor} opacity="0.2"
              clipPath="url(#trackClip)" />

        {/* Tick marks */}
        {Array.from({ length: 11 }, (_, i) => {
          const tx = valToX(i);
          const active = i <= intensity;
          return (
            <line key={i} x1={tx} y1={H - 8} x2={tx} y2={H - 3}
                  stroke={active ? faceColor : "rgba(255,255,255,0.15)"}
                  strokeWidth="2" strokeLinecap="round"
                  clipPath="url(#trackClip)" />
          );
        })}

        {/* Face thumb */}
        <circle cx={thumbX} cy={H / 2} r={TR}
                fill={faceColor}
                stroke="rgba(0,0,0,0.15)" strokeWidth="2" />

        {/* Face features */}
        <g transform={`translate(${thumbX - TR}, ${H / 2 - TR}) scale(${fScale})`}>
          <path fill="rgba(0,0,0,0.65)" d={face.leftEye} />
          <path fill="rgba(0,0,0,0.65)" d={face.rightEye} />
          <path fill="rgba(0,0,0,0.65)" d={face.mouth} />
        </g>
      </svg>

      {/* ── Intensity label ── */}
      <div className="mt-1.5 flex items-center gap-2">
        <span className="text-base font-bold tabular-nums" style={{ color: faceColor }}>
          {intensity}
        </span>
        {point.bodyPart && (
          <span className="text-[10px] font-medium text-white/50">
            {point.bodyPart}
          </span>
        )}
      </div>
    </div>
  );
}
