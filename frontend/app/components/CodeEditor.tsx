"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

import { useTabStore } from "../hooks/useTabStore";
import { useResizable } from "../hooks/useResizable";
import { useRunCode } from "../hooks/useRunCode";

import { EditorHeader } from "./EditorHeader";
import { TabBar } from "./TabBar";
import { OutputPanel } from "./OutputPanel";
import { MobileEditor, type MobileEditorHandle } from "./MobileEditor";

const MIN_OUTPUT_HEIGHT = 40;

export default function CodeEditor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const mobileEditorRef = useRef<MobileEditorHandle | null>(null);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    // iPadOS 13+ reports as MacIntel with touch points
    const isIPad = /MacIntel/.test(navigator.platform) && navigator.maxTouchPoints > 1;
    setIsMobile(/Mobi|Android|iPhone|iPad|iPod/i.test(ua) || isIPad);
  }, []);

  const { tabs, activeTabId, activeTab, tabsRef, activeTabIdRef, setTabs, updateActiveTab, switchTab, addTab, closeTab } =
    useTabStore();

  const { height: outputHeight, setHeight: setOutputHeight, onMouseDown: onDragMouseDown, onTouchStart: onDragTouchStart } =
    useResizable(containerRef, MIN_OUTPUT_HEIGHT, MIN_OUTPUT_HEIGHT, 0.75);

  const getCode = () => {
    if (isMobile) return mobileEditorRef.current?.getValue() ?? "";
    return editorRef.current?.getValue() ?? "";
  };

  const { runCode, runCodeRef, loading } = useRunCode(getCode, activeTabIdRef, setTabs);

  // Auto-expand output panel when a result arrives on the active tab
  useEffect(() => {
    const tab = tabsRef.current.find(t => t.id === activeTabIdRef.current);
    if (tab && (tab.result || tab.error) && outputHeight === MIN_OUTPUT_HEIGHT) {
      setOutputHeight(220);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab?.result, activeTab?.error]);

  // ── Unified editor helpers ─────────────────────────────────────────────────

  const editorSetValue = (value: string) => {
    if (isMobile) mobileEditorRef.current?.setValue(value);
    else editorRef.current?.setValue(value);
  };

  const editorFocus = () => {
    if (isMobile) mobileEditorRef.current?.focus();
    else editorRef.current?.focus();
  };

  // ── Monaco callbacks ───────────────────────────────────────────────────────

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => runCodeRef.current());
    const tab = tabsRef.current.find(t => t.id === activeTabIdRef.current);
    editor.setValue(tab?.code ?? "");
    editor.focus();
  };

  const handleEditorChange: OnChange = (value) => {
    updateActiveTab({ code: value ?? "" });
  };

  // ── Tab actions ────────────────────────────────────────────────────────────

  const handleSwitchTab = (id: string) => {
    const tab = switchTab(id);
    if (!tab) return;
    editorSetValue(tab.code);
    editorFocus();
    setOutputHeight(tab.result || tab.error ? 220 : MIN_OUTPUT_HEIGHT);
  };

  const handleAddTab = () => {
    const tab = addTab();
    editorSetValue(tab.code);
    editorFocus();
    setOutputHeight(MIN_OUTPUT_HEIGHT);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = closeTab(id);
    if (next) {
      editorSetValue(next.code);
      editorFocus();
      setOutputHeight(next.result || next.error ? 220 : MIN_OUTPUT_HEIGHT);
    }
  };

  // ── Editor actions ─────────────────────────────────────────────────────────

  const clearCode = () => {
    editorSetValue("");
    updateActiveTab({ code: "" });
    editorFocus();
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCode());
  };

  const pasteCode = async () => {
    const text = await navigator.clipboard.readText();
    if (!text) return;
    editorSetValue(text);
    updateActiveTab({ code: text });
    editorFocus();
  };

  const clearOutput = () => {
    updateActiveTab({ result: null, error: null });
    setOutputHeight(MIN_OUTPUT_HEIGHT);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div ref={containerRef} className="flex flex-col h-screen bg-[#0d0d0f] text-white overflow-hidden">
      <EditorHeader
        loading={loading}
        activeTab={activeTab}
        onRun={runCode}
        onClearCode={clearCode}
        onCopyCode={copyCode}
        onPasteCode={pasteCode}
      />

      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitch={handleSwitchTab}
        onAdd={handleAddTab}
        onClose={handleCloseTab}
      />

      <div className="flex-1 min-h-0">
        {isMobile ? (
          <MobileEditor
            value={activeTab?.code ?? ""}
            onChange={(v) => updateActiveTab({ code: v })}
            handleRef={mobileEditorRef}
          />
        ) : (
          <Editor
            defaultLanguage="python"
            defaultValue=""
            theme="vs-dark"
            onMount={handleEditorMount}
            onChange={handleEditorChange}
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
              dragAndDrop: false,
              suggest: { showWords: false },
              bracketPairColorization: { enabled: true },
              guides: { bracketPairs: true },
            }}
          />
        )}
      </div>

      <OutputPanel
        activeTab={activeTab}
        loading={loading}
        height={outputHeight}
        onDragMouseDown={onDragMouseDown}
        onDragTouchStart={onDragTouchStart}
        onClearOutput={clearOutput}
      />
    </div>
  );
}
