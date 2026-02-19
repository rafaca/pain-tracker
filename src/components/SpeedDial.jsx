import { useState } from "react";

const SpeedDialAction = ({ icon, label, onClick, delay = 0 }) => (
  <div className="group/action flex items-center gap-3">
    <span
      className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-md bg-gray-900/90
                 px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg backdrop-blur-sm
                 transition-opacity duration-200 group-hover/action:opacity-100"
    >
      {label}
    </span>
    <button
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10
                 bg-bg-sidebar text-text-secondary shadow-lg backdrop-blur-sm
                 transition-all duration-200 hover:scale-110 hover:border-accent hover:text-accent
                 active:scale-95"
      style={{ transitionDelay: `${delay}ms` }}
      title={label}
    >
      {icon}
    </button>
  </div>
);

export default function SpeedDial({
  onToggleNotes,
  onToggleTimeline,
  onSubmit,
  onClearAll,
  hasPoints,
  isLoggedIn,
}) {
  const [open, setOpen] = useState(false);

  const actions = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
        </svg>
      ),
      label: "Notes",
      onClick: () => { onToggleNotes(); setOpen(false); },
    },
    ...(isLoggedIn
      ? [
          {
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            label: "History",
            onClick: () => { onToggleTimeline(); setOpen(false); },
          },
        ]
      : []),
    ...(hasPoints
      ? [
          {
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            ),
            label: "Clear All",
            onClick: () => { onClearAll(); setOpen(false); },
          },
          {
            icon: (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            ),
            label: "Submit Entry",
            onClick: () => { onSubmit(); setOpen(false); },
          },
        ]
      : []),
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-3 md:bottom-8 md:right-8">
      {/* Action buttons - appear above the main button */}
      <div
        className={`flex flex-col items-center gap-2 transition-all duration-300 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        {actions.map((action, i) => (
          <SpeedDialAction
            key={action.label}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            delay={open ? i * 50 : 0}
          />
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg-primary
                   shadow-xl shadow-accent/25 transition-all duration-300 hover:shadow-accent/40
                   active:scale-95 ${open ? "rotate-45" : "rotate-0"}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="h-6 w-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
    </div>
  );
}
