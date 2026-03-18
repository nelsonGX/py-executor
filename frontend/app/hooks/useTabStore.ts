import { useCallback, useEffect, useRef, useState } from "react";
import type { Tab } from "../lib/types";
import { makeTab, persistTabs, restoreTabs } from "../lib/storage";

const DEFAULT_CODE =
  `# Write your Python code here\nprint("Hello, World!")\n\n# Multi-line example:\nfor i in range(5):\n    print(f"Line {i + 1}")\n`;

export function useTabStore() {
  const tabsRef = useRef<Tab[]>([]);
  const activeTabIdRef = useRef<string>("");

  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState("");

  // Keep ref in sync
  useEffect(() => { tabsRef.current = tabs; }, [tabs]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = restoreTabs() ?? [makeTab("Tab 1", DEFAULT_CODE)];
    tabsRef.current = saved;
    setTabs(saved);
    setActiveTabId(saved[0].id);
    activeTabIdRef.current = saved[0].id;
  }, []);

  // Persist on every change
  useEffect(() => {
    if (tabs.length) persistTabs(tabs);
  }, [tabs]);

  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  const updateActiveTab = useCallback((patch: Partial<Tab>) => {
    const id = activeTabIdRef.current;
    setTabs(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t));
  }, []);

  // Returns the tab switched to (so callers can update editor value)
  const switchTab = useCallback((id: string): Tab | null => {
    if (id === activeTabIdRef.current) return null;
    const tab = tabsRef.current.find(t => t.id === id);
    if (!tab) return null;
    setActiveTabId(id);
    activeTabIdRef.current = id;
    return tab;
  }, []);

  // Returns the new tab (so caller can update editor value)
  const addTab = useCallback((): Tab => {
    const tab = makeTab(`Tab ${tabsRef.current.length + 1}`, "");
    setTabs(prev => [...prev, tab]);
    tabsRef.current = [...tabsRef.current, tab];
    setActiveTabId(tab.id);
    activeTabIdRef.current = tab.id;
    return tab;
  }, []);

  // Returns the tab to switch to after closing (so caller can update editor), or null
  const closeTab = useCallback((id: string): Tab | null => {
    if (tabsRef.current.length === 1) return null;
    const idx = tabsRef.current.findIndex(t => t.id === id);
    const next = tabsRef.current[idx === 0 ? 1 : idx - 1];
    setTabs(prev => prev.filter(t => t.id !== id));
    tabsRef.current = tabsRef.current.filter(t => t.id !== id);
    if (id === activeTabIdRef.current) {
      setActiveTabId(next.id);
      activeTabIdRef.current = next.id;
      return next;
    }
    return null;
  }, []);

  return {
    tabs,
    activeTabId,
    activeTab,
    tabsRef,
    activeTabIdRef,
    setTabs,
    updateActiveTab,
    switchTab,
    addTab,
    closeTab,
  };
}
