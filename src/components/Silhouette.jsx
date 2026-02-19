import { useCallback } from "react";
import PainDial, { intensityToColor } from "./PainDial";

export default function Silhouette({
  gender,
  painPoints,
  activeDial,
  onBodyClick,
  onIntensityChange,
  onConfirmPoint,
  onRemovePoint,
}) {
  const handleClick = useCallback(
    (e) => {
      const wrapper = e.currentTarget;
      const rect = wrapper.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      onBodyClick(x, y);
    },
    [onBodyClick]
  );

  return (
    <div className="flex h-full items-center justify-center overflow-visible">
      <div
        className="relative cursor-crosshair overflow-visible"
        style={{ height: "90vh", aspectRatio: "110 / 135" }}
        onClick={handleClick}
      >
        {/* Silhouette image */}
        <img
          src={`/silhouettes/${gender}.svg`}
          alt={`${gender} silhouette`}
          className="pointer-events-none block h-full w-full object-contain"
          draggable={false}
        />

        {/* Pain point markers (confirmed) */}
        <svg className="silhouette-overlay absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <filter id="pointGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {painPoints.map((pt) => {
            const color = intensityToColor(pt.intensity);
            const glowSize = pt.intensity * 0.04;
            return (
              <g key={pt.id}>
                {/* Colored circle with glow */}
                <circle
                  cx={`${pt.x}%`}
                  cy={`${pt.y}%`}
                  r="8"
                  fill={color}
                  opacity="0.85"
                  filter="url(#pointGlow)"
                  style={{
                    filter: `drop-shadow(0 0 ${glowSize}px ${color})`,
                    transition: "all 0.3s ease",
                  }}
                />
                {/* Intensity number */}
                <text
                  x={`${pt.x}%`}
                  y={`${pt.y}%`}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#000"
                  fontSize="6"
                  fontWeight="bold"
                  style={{ userSelect: "none", pointerEvents: "none" }}
                >
                  {pt.intensity}
                </text>
                {/* Body part label */}
                {pt.bodyPart && (
                  <text
                    x={`${pt.x}%`}
                    y={`${pt.y + 3.5}%`}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="rgba(255,255,255,0.85)"
                    fontSize="3"
                    fontWeight="500"
                    style={{ userSelect: "none", pointerEvents: "none" }}
                  >
                    {pt.bodyPart}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Active dial (being adjusted) */}
        {activeDial && (
          <PainDial
            point={activeDial}
            onIntensityChange={onIntensityChange}
            onConfirm={onConfirmPoint}
            onRemove={onRemovePoint}
          />
        )}
      </div>
    </div>
  );
}
