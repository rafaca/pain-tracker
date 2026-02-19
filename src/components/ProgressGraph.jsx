export default function ProgressGraph({ entries = [] }) {
  const isSample = entries.length === 0;

  // Sample data for empty state
  const sampleData = [4, 6, 5, 7, 6, 3, 2];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const data = isSample
    ? sampleData
    : entries.slice(-7).map((e) => Math.max(...e.points.map((p) => p.intensity), 0));

  const maxVal = 10;
  const width = 280;
  const height = 192;
  const padLeft = 28;
  const padRight = 28;
  const padTop = 36;
  const padBottom = 40;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const points = data.map((val, i) => ({
    x: padLeft + (i / (data.length - 1)) * chartW,
    y: padTop + chartH - (val / maxVal) * chartH,
    val,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${padTop + chartH} L${points[0].x},${padTop + chartH} Z`;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c1545] to-[#111d5a]"
         style={{ height: `${height}px` }}>
      {isSample && (
        <div className="absolute right-2.5 top-2 z-10 text-[9px] font-medium tracking-wide text-white/30">
          Sample data
        </div>
      )}
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="graphFillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.33, 0.66].map((pct, i) => (
          <line key={i} x1={padLeft} y1={padTop + chartH * (1 - pct)} x2={padLeft + chartW} y2={padTop + chartH * (1 - pct)}
                stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#graphFillGrad)" />

        {/* Line */}
        <path d={linePath} fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              opacity="0.6" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#0c1545" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx={p.x} cy={p.y} r="2"
                    fill={p.val >= 7 ? "#f97316" : p.val >= 4 ? "#eab308" : "#22c55e"} />
          </g>
        ))}

        {/* Day labels */}
        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 12} textAnchor="middle"
                fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="inherit">
            {days[i] || ""}
          </text>
        ))}
      </svg>
    </div>
  );
}
