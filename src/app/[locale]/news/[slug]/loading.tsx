export default function Loading() {
  return (
    <div className="wayon-container px-[15px] py-24 max-w-3xl">
      {/* Article hero */}
      <div className="aspect-[16/7] w-full animate-pulse bg-[color:var(--muted)]/20" />
      <div className="mt-8 h-9 w-3/4 animate-pulse bg-[color:var(--muted)]/20" />
      <div className="mt-3 h-4 w-1/4 animate-pulse bg-[color:var(--muted)]/10" />
      {/* Body lines */}
      <div className="mt-10 flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`h-4 animate-pulse bg-[color:var(--muted)]/10 ${i % 3 === 2 ? "w-2/3" : "w-full"}`}
          />
        ))}
      </div>
    </div>
  );
}
