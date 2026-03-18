import { useState } from "react";
import AnsiToHtml from "ansi-to-html";
import type { Tab } from "../lib/types";
import { IconButton } from "./IconButton";

const ansiConverter = new AnsiToHtml({ escapeXML: true, newline: true });

export function OutputPanel({
  activeTab,
  loading,
  height,
  onDragMouseDown,
  onDragTouchStart,
  onClearOutput,
}: {
  activeTab: Tab | null;
  loading: boolean;
  height: number;
  onDragMouseDown: (e: React.MouseEvent) => void;
  onDragTouchStart: (e: React.TouchEvent) => void;
  onClearOutput: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const hasOutput =
    !!(activeTab?.result && (activeTab.result.stdout || activeTab.result.stderr)) ||
    !!activeTab?.error;

  const copyOutput = () => {
    if (!activeTab) return;
    const text = [activeTab.error, activeTab.result?.stdout, activeTab.result?.stderr]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      {/* Drag handle */}
      <div
        onMouseDown={onDragMouseDown}
        onTouchStart={onDragTouchStart}
        className="group shrink-0 h-[10px] cursor-ns-resize flex items-center justify-center hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors touch-none"
      >
        <div className="w-8 h-[3px] rounded-full bg-white/[0.08] group-hover:bg-white/20 transition-colors" />
      </div>

      {/* Panel */}
      <div
        className="shrink-0 flex flex-col border-t border-white/[0.07]"
        style={{ height }}
      >
        {/* Toolbar */}
        <div className="flex items-center px-4 h-8 shrink-0 bg-[#111114] border-b border-white/[0.07]">
          <span className="text-[10px] font-semibold text-white/25 uppercase tracking-widest">Output</span>
          {activeTab?.result && (
            <span className="ml-2.5 text-[10px] text-white/20 font-mono">
              rc={activeTab.result.returncode}
            </span>
          )}
          <div className="ml-auto flex items-center gap-0.5">
            {hasOutput && (
              <>
                <IconButton onClick={copyOutput}>
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
                <IconButton onClick={onClearOutput}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 00.249.225h5.19a.25.25 0 00.249-.225l.66-6.6a.75.75 0 011.493.149l-.66 6.6A1.748 1.748 0 0110.595 15h-5.19a1.75 1.75 0 01-1.742-1.576l-.66-6.6a.75.75 0 011.493-.149z" />
                  </svg>
                  Clear
                </IconButton>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-auto bg-[#0d0d0f] select-text"  style={{ WebkitUserSelect: "text", userSelect: "text" }}>
          {!hasOutput ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-[11px] text-white/15 font-mono select-none">
                {loading ? "Executing…" : "No output — press ⌘↵ to run"}
              </span>
            </div>
          ) : (
            <div className="p-4 font-mono text-[13px] leading-relaxed">
              {activeTab?.error && (
                <pre className="text-red-400 whitespace-pre-wrap">{activeTab.error}</pre>
              )}
              {activeTab?.result?.stdout && (
                <pre
                  className="text-[#e2e8f0] whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: ansiConverter.toHtml(activeTab.result.stdout) }}
                />
              )}
              {activeTab?.result?.stderr && (
                <pre
                  className="text-red-400 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: ansiConverter.toHtml(activeTab.result.stderr) }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
