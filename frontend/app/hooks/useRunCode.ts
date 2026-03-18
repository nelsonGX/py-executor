import { useCallback, useRef, useState } from "react";
import type { Tab } from "../lib/types";

export function useRunCode(
  getCode: () => string,
  activeTabIdRef: React.RefObject<string>,
  setTabs: React.Dispatch<React.SetStateAction<Tab[]>>,
) {
  const [loading, setLoading] = useState(false);

  const runCode = useCallback(async () => {
    const code = getCode();
    if (!code?.trim()) return;
    const tabId = activeTabIdRef.current;

    setLoading(true);
    setTabs(prev => prev.map(t => t.id === tabId ? { ...t, result: null, error: null } : t));

    try {
      const res = await fetch("https://py-api.fju.me/exec_code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      const data = await res.json();
      if (data.error)
        setTabs(prev => prev.map(t => t.id === tabId ? { ...t, error: data.error } : t));
      else
        setTabs(prev => prev.map(t => t.id === tabId ? { ...t, result: data.result } : t));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setTabs(prev => prev.map(t => t.id === tabId ? { ...t, error: msg } : t));
    } finally {
      setLoading(false);
    }
  }, [getCode, activeTabIdRef, setTabs]);

  // Stable ref so Monaco keybinding can always call the latest version
  const runCodeRef = useRef(runCode);
  runCodeRef.current = runCode;

  return { runCode, runCodeRef, loading };
}
