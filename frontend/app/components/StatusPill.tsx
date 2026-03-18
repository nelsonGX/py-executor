import type { Tab } from "../lib/types";

const PILL_COLORS = {
  amber:   "bg-amber-400/10   text-amber-300   ring-amber-400/25",
  red:     "bg-red-500/10     text-red-400     ring-red-500/25",
  orange:  "bg-orange-500/10  text-orange-400  ring-orange-500/25",
  emerald: "bg-emerald-500/10 text-emerald-400  ring-emerald-500/25",
} as const;

const DOT_COLORS = {
  amber:   "bg-amber-400",
  red:     "bg-red-400",
  orange:  "bg-orange-400",
  emerald: "bg-emerald-400",
} as const;

export function Pill({
  color,
  dot,
  pulse,
  children,
}: {
  color: keyof typeof PILL_COLORS;
  dot?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ${PILL_COLORS[color]}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${DOT_COLORS[color]} ${pulse ? "animate-pulse" : ""}`} />
      )}
      {children}
    </span>
  );
}

export function StatusPill({ loading, activeTab }: { loading: boolean; activeTab: Tab | null }) {
  if (loading)
    return <Pill color="amber" dot pulse>Running</Pill>;
  if (activeTab?.error)
    return <Pill color="red" dot>Error</Pill>;
  if (!activeTab?.result) return null;
  if (activeTab.result.timed_out)
    return <Pill color="orange" dot>Timed Out</Pill>;
  if (activeTab.result.success)
    return <Pill color="emerald" dot>Exit 0</Pill>;
  return <Pill color="red" dot>Exit {activeTab.result.returncode}</Pill>;
}
