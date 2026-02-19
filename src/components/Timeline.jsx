function intensityToColor(intensity) {
  const t = intensity / 10;
  const r = 255;
  const g = Math.round(255 * (1 - t));
  const b = Math.round(255 * (1 - t));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function Timeline({ entries = [], loading, onClose, onSelectEntry }) {
  return (
    <div className="fixed inset-y-0 right-0 z-[200] flex w-full max-w-[350px] flex-col
                    border-l border-border bg-bg-secondary animate-[slideIn_0.3s_ease]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h2 className="text-lg font-semibold">History</h2>
        <button
          onClick={onClose}
          className="px-2 py-1 text-2xl leading-none text-text-secondary
                     transition-colors hover:text-text-primary"
        >
          &times;
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading && (
          <div className="py-8 text-center text-text-secondary">Loading entries...</div>
        )}

        {!loading && entries.length === 0 && (
          <div className="py-8 text-center text-text-secondary">
            <p className="mb-1">No entries yet</p>
            <p className="text-xs">Your pain entries will appear here</p>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <div className="flex flex-col gap-2">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="w-full rounded-lg border border-border bg-white/5 p-3 text-left
                           text-text-primary transition-all duration-200
                           hover:border-accent hover:bg-white/10"
              >
                <div className="mb-1 text-[13px] text-text-secondary">
                  {new Date(entry.timestamp).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{entry.points.length} point{entry.points.length !== 1 ? "s" : ""}</span>
                  <span className="font-semibold" style={{ color: intensityToColor(Math.max(...entry.points.map(p => p.intensity))) }}>
                    Max: {Math.max(...entry.points.map(p => p.intensity))}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {entry.points.slice(0, 5).map((p, i) => (
                    <div
                      key={i}
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: intensityToColor(p.intensity) }}
                    />
                  ))}
                  {entry.points.length > 5 && (
                    <span className="ml-1 text-xs text-text-secondary">
                      +{entry.points.length - 5}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
