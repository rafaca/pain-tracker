export default function NotesDrawer({ open, notes, onChange, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full rounded-t-2xl bg-bg-sidebar p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0))] animate-[slideUp_0.3s_ease]">
        <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-white/20" />
        <div className="mb-2 text-[13px] font-semibold text-text-secondary">Notes</div>
        <textarea
          className="w-full resize-none rounded-lg border border-border bg-white/4 p-2.5
                     text-base leading-relaxed text-text-primary placeholder:text-white/25
                     focus:border-accent focus:outline-none"
          rows={5}
          placeholder="Describe your symptoms, triggers, medication..."
          value={notes}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          onClick={onClose}
          className="mt-3 w-full rounded-lg border border-border bg-white/5 py-2.5 text-sm
                     font-medium text-text-primary transition-colors duration-200 hover:bg-white/10"
        >
          Done
        </button>
      </div>
    </div>
  );
}
