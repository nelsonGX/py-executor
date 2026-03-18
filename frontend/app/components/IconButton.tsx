export function IconButton({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-white/35 hover:text-white/80 hover:bg-white/[0.07] active:bg-white/[0.11] transition-all duration-100"
    >
      {children}
    </button>
  );
}
