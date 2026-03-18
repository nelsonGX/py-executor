"use client";

import { useEffect, useRef } from "react";
import SimpleEditor from "react-simple-code-editor";
import Prism from "prismjs";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";

export type MobileEditorHandle = {
  getValue: () => string;
  setValue: (v: string) => void;
  focus: () => void;
};

const highlight = (code: string) =>
  Prism.highlight(code, Prism.languages.python, "python");

export function MobileEditor({
  value,
  onChange,
  handleRef,
}: {
  value: string;
  onChange: (v: string) => void;
  handleRef: React.RefObject<MobileEditorHandle | null>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    handleRef.current = {
      getValue: () => value,
      setValue: (v: string) => onChange(v),
      focus: () => containerRef.current?.querySelector("textarea")?.focus(),
    };
  }, [handleRef, onChange, value]);

  return (
    <div ref={containerRef} className="w-full h-full overflow-auto bg-[#1e1e1e]">
      <SimpleEditor
        value={value}
        onValueChange={onChange}
        highlight={highlight}
        padding={20}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        style={{
          fontFamily: "'Geist Mono', 'Fira Code', 'JetBrains Mono', monospace",
          fontSize: 14,
          lineHeight: 1.6,
          minHeight: "100%",
          caretColor: "#aeafad",
        }}
      />
    </div>
  );
}
