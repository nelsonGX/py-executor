import type { Tab } from "../lib/types";

export function TabBar({
  tabs,
  activeTabId,
  onSwitch,
  onAdd,
  onClose,
}: {
  tabs: Tab[];
  activeTabId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onClose: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="flex items-stretch h-9 shrink-0 bg-[#0d0d0f] border-b border-white/[0.07] overflow-x-auto">
      {tabs.map(tab => {
        const active = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            onClick={() => onSwitch(tab.id)}
            className={[
              "group relative flex items-center gap-2 px-4 min-w-[96px] max-w-[160px] text-xs font-medium",
              "border-r border-white/[0.06] transition-colors duration-100 select-none shrink-0",
              active
                ? "bg-[#111114] text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#2563eb]"
                : "text-white/40 hover:text-white/65 hover:bg-white/[0.03]",
            ].join(" ")}
          >
            <span className="truncate flex-1 text-left">{tab.name}</span>
            {tabs.length > 1 && (
              <span
                role="button"
                onClick={(e) => onClose(tab.id, e)}
                className="flex items-center justify-center w-3.5 h-3.5 rounded shrink-0 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-400/10 transition-all"
              >
                <svg viewBox="0 0 12 12" fill="currentColor" className="w-2.5 h-2.5">
                  <path d="M2.22 2.22a.75.75 0 011.06 0L6 4.94l2.72-2.72a.75.75 0 111.06 1.06L7.06 6l2.72 2.72a.75.75 0 11-1.06 1.06L6 7.06l-2.72 2.72a.75.75 0 01-1.06-1.06L4.94 6 2.22 3.28a.75.75 0 010-1.06z" />
                </svg>
              </span>
            )}
          </button>
        );
      })}

      <button
        onClick={onAdd}
        title="New tab"
        className="flex items-center justify-center w-9 shrink-0 text-white/25 hover:text-white/60 hover:bg-white/[0.04] transition-colors"
      >
        <svg viewBox="0 0 12 12" fill="currentColor" className="w-3 h-3">
          <path d="M6 1a.75.75 0 01.75.75v3.5h3.5a.75.75 0 010 1.5h-3.5v3.5a.75.75 0 01-1.5 0v-3.5h-3.5a.75.75 0 010-1.5h3.5v-3.5A.75.75 0 016 1z" />
        </svg>
      </button>
    </div>
  );
}
