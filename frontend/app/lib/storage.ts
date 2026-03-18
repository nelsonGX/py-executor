import type { Tab } from "./types";

const STORAGE_KEY = "py-executor-tabs";

function encodeCode(code: string): string {
  return btoa(unescape(encodeURIComponent(code)));
}

function decodeCode(encoded: string): string {
  try { return decodeURIComponent(escape(atob(encoded))); } catch { return ""; }
}

export function makeTab(name: string, code = ""): Tab {
  return { id: crypto.randomUUID(), name, code, result: null, error: null };
}

export function persistTabs(tabs: Tab[]) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(tabs.map(t => ({ id: t.id, name: t.name, code: encodeCode(t.code) })))
    );
  } catch { /* quota exceeded */ }
}

export function restoreTabs(): Tab[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { id: string; name: string; code: string }[];
    if (!Array.isArray(data) || !data.length) return null;
    return data.map(t => ({ id: t.id, name: t.name, code: decodeCode(t.code), result: null, error: null }));
  } catch { return null; }
}
