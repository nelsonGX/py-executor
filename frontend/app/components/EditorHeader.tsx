import { useState } from "react";
import type { Tab } from "../lib/types";
import { IconButton } from "./IconButton";
import { StatusPill } from "./StatusPill";

export function EditorHeader({
  loading,
  activeTab,
  onRun,
  onClearCode,
  onPasteCode,
  onCopyCode,
}: {
  loading: boolean;
  activeTab: Tab | null;
  onRun: () => void;
  onClearCode: () => void;
  onPasteCode: () => Promise<void>;
  onCopyCode: () => void;
}) {
  const [pasted, setPasted] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePaste = async () => {
    await onPasteCode();
    setPasted(true);
    setTimeout(() => setPasted(false), 1500);
  };

  const handleCopy = () => {
    onCopyCode();
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <header className="flex items-center justify-between px-4 h-11 shrink-0 bg-[#111114] border-b border-white/[0.07]">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-[#2563eb] shrink-0">
          <span className="text-[10px] font-bold text-white leading-none">Py</span>
        </div>
        <span className="text-sm font-semibold text-white/80 tracking-tight">Python Executor</span>
      </div>

      <div className="flex items-center gap-2">
        <StatusPill loading={loading} activeTab={activeTab} />

        <IconButton onClick={handleCopy} title="Copy code">
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
              </svg>
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z" />
                <path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z" />
              </svg>
              Copy
            </>
          )}
        </IconButton>

        <IconButton onClick={handlePaste} title="Paste from clipboard">
          {pasted ? (
            <>
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
              </svg>
              <span className="text-emerald-400">Pasted</span>
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.75 1a.75.75 0 00-.75.75v3c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-3a.75.75 0 00-.75-.75h-4.5zm.75 3V2.5h3V4h-3zm-2.874-.467a.75.75 0 00-.752-1.298A1.75 1.75 0 002 4.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 13.25v-8.5a1.75 1.75 0 00-1.124-1.635.75.75 0 10-.752 1.298.25.25 0 01.126.337v8.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.126-.337z" />
              </svg>
              Paste
            </>
          )}
        </IconButton>

        <IconButton onClick={onClearCode} title="Clear code">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 00.249.225h5.19a.25.25 0 00.249-.225l.66-6.6a.75.75 0 011.493.149l-.66 6.6A1.748 1.748 0 0110.595 15h-5.19a1.75 1.75 0 01-1.742-1.576l-.66-6.6a.75.75 0 011.493-.149z" />
          </svg>
          Clear
        </IconButton>

        <button
          onClick={onRun}
          disabled={loading}
          className={[
            "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-semibold select-none",
            "transition-all duration-100",
            loading
              ? "bg-white/5 text-white/25 cursor-not-allowed"
              : "bg-[#16a34a] text-white hover:bg-[#15803d] active:bg-[#166534] active:scale-[0.97]",
          ].join(" ")}
        >
          {loading ? (
            <svg className="animate-spin w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 12 12" fill="currentColor">
              <path d="M2 1.5l9 4.5-9 4.5V1.5z" />
            </svg>
          )}
          {loading ? "Running…" : "Run"}
          {!loading && (
            <kbd className="hidden sm:inline-flex px-1 py-px rounded text-[10px] font-mono bg-black/25 text-white/50">
              ⌘↵
            </kbd>
          )}
        </button>
      </div>
    </header>
  );
}
