"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import AnsiToHtml from "ansi-to-html";

interface ExecutionResult {
  stdout: string;
  stderr: string;
  returncode: number;
  success: boolean;
  timed_out: boolean;
}

const DEFAULT_CODE = `# Write your Python code here
print("Hello, World!")

# Multi-line example:
for i in range(5):
    print(f"Line {i + 1}")
`;

const MIN_OUTPUT_HEIGHT = 40;
const MAX_OUTPUT_RATIO = 0.75;
const ansiConverter = new AnsiToHtml({ escapeXML: true, newline: true });

export default function CodeEditor() {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outputHeight, setOutputHeight] = useState(MIN_OUTPUT_HEIGHT);
  const [copied, setCopied] = useState(false);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const hasOutput = !!(result && (result.stdout || result.stderr)) || !!error;

  // Expand output panel when result arrives
  useEffect(() => {
    if (hasOutput && outputHeight === MIN_OUTPUT_HEIGHT) {
      setOutputHeight(220);
    }
  }, [hasOutput]); // eslint-disable-line react-hooks/exhaustive-deps

  const runCodeRef = useRef<() => void>(() => {});

  const runCode = useCallback(async () => {
    const editor = editorRef.current;
    if (!editor) return;
    const code = editor.getValue();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/exec_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  runCodeRef.current = runCode;

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runCodeRef.current();
    });
    editor.focus();
  };

  // Drag to resize
  const onDragStart = (e: React.MouseEvent) => {
    isDragging.current = true;
    dragStartY.current = e.clientY;
    dragStartHeight.current = outputHeight;
    document.body.style.cursor = "ns-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const containerH = containerRef.current.clientHeight;
      const delta = dragStartY.current - e.clientY;
      const next = Math.min(
        Math.max(dragStartHeight.current + delta, MIN_OUTPUT_HEIGHT),
        containerH * MAX_OUTPUT_RATIO
      );
      setOutputHeight(next);
    };
    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const copyOutput = () => {
    const text = [error, result?.stdout, result?.stderr].filter(Boolean).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const clearOutput = () => {
    setResult(null);
    setError(null);
    setOutputHeight(MIN_OUTPUT_HEIGHT);
  };

  const statusPill = () => {
    if (loading)
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Running
        </span>
      );
    if (error)
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Error
        </span>
      );
    if (!result) return null;
    if (result.timed_out)
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 ring-1 ring-orange-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
          Timed Out
        </span>
      );
    if (result.success)
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Exit 0
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 ring-1 ring-red-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        Exit {result.returncode}
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col h-screen bg-[#0d0d0f] text-white overflow-hidden"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-5 h-12 shrink-0 bg-[#111114] border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          {/* Python logo mark */}
          <div className="flex items-center justify-center w-6 h-6 rounded bg-[#2563eb]">
            <span className="text-[10px] font-bold text-white leading-none">Py</span>
          </div>
          <span className="text-sm font-semibold text-white/90 tracking-tight">Python Executor</span>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-xs text-white/30 font-mono">main.py</span>
        </div>

        <div className="flex items-center gap-3">
          {statusPill()}

          <button
            onClick={runCode}
            disabled={loading}
            className={`
              relative inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold
              transition-all duration-150 select-none
              ${loading
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-[#16a34a] text-white hover:bg-[#15803d] active:bg-[#166534] active:scale-95"
              }
            `}
          >
            {loading ? (
              <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
                <path d="M2 1.5l9 4.5-9 4.5V1.5z" />
              </svg>
            )}
            {loading ? "Running…" : "Run"}
            {!loading && (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-0.5 px-1 py-px rounded text-[10px] font-mono bg-black/20 text-white/60">
                ⌘↵
              </kbd>
            )}
          </button>
        </div>
      </header>

      {/* Editor area */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          defaultLanguage="python"
          defaultValue={DEFAULT_CODE}
          theme="vs-dark"
          onMount={handleEditorMount}
          options={{
            fontSize: 14,
            fontFamily: "'Geist Mono', 'Fira Code', 'JetBrains Mono', monospace",
            fontLigatures: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            renderLineHighlight: "line",
            tabSize: 4,
            insertSpaces: true,
            wordWrap: "on",
            padding: { top: 20, bottom: 20 },
            smoothScrolling: true,
            cursorBlinking: "phase",
            suggest: { showWords: false },
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true },
          }}
        />
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onDragStart}
        className="group shrink-0 h-[5px] bg-transparent hover:bg-white/5 cursor-ns-resize flex items-center justify-center transition-colors"
        title="Drag to resize output"
      >
        <div className="w-10 h-[3px] rounded-full bg-white/10 group-hover:bg-white/25 transition-colors" />
      </div>

      {/* Output panel */}
      <div
        className="shrink-0 flex flex-col bg-[#0d0d0f] border-t border-white/[0.06]"
        style={{ height: outputHeight }}
      >
        {/* Output toolbar */}
        <div className="flex items-center px-4 h-9 shrink-0 bg-[#111114] border-b border-white/[0.06]">
          <span className="text-[11px] font-semibold text-white/30 uppercase tracking-widest">Output</span>

          {result && !result.timed_out && (
            <span className="ml-3 text-[11px] text-white/20 font-mono">
              rc={result.returncode}
            </span>
          )}

          <div className="ml-auto flex items-center gap-1">
            {hasOutput && (
              <>
                <button
                  onClick={copyOutput}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
                  title="Copy output"
                >
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
                </button>
                <button
                  onClick={clearOutput}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-white/40 hover:text-white/80 hover:bg-white/5 transition-all"
                  title="Clear output"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675l.66 6.6a.25.25 0 00.249.225h5.19a.25.25 0 00.249-.225l.66-6.6a.75.75 0 011.493.149l-.66 6.6A1.748 1.748 0 0110.595 15h-5.19a1.75 1.75 0 01-1.742-1.576l-.66-6.6a.75.75 0 011.493-.149z" />
                  </svg>
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        {/* Output content */}
        <div className="flex-1 min-h-0 overflow-auto">
          {!hasOutput ? (
            <div className="flex items-center justify-center h-full">
              <span className="text-[12px] text-white/15 font-mono">
                {loading ? "Executing…" : "No output yet — press ⌘↵ to run"}
              </span>
            </div>
          ) : (
            <div className="p-4 font-mono text-[13px] leading-relaxed space-y-1">
              {error && (
                <pre className="text-red-400 whitespace-pre-wrap">{error}</pre>
              )}
              {result?.stdout && (
                <pre
                  className="text-[#e2e8f0] whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: ansiConverter.toHtml(result.stdout) }}
                />
              )}
              {result?.stderr && (
                <pre
                  className="text-red-400 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: ansiConverter.toHtml(result.stderr) }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
