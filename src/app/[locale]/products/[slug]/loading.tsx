export default function Loading() {
  return (
    <div className="wayon-container px-[15px] py-24">
      {/* Hero skeleton */}
      <div className="aspect-[16/7] w-full animate-pulse bg-[color:var(--muted)]/20" />
      <div className="mt-10 h-10 w-1/2 animate-pulse bg-[color:var(--muted)]/20" />
      <div className="mt-4 h-5 w-2/3 animate-pulse bg-[color:var(--muted)]/10" />
      <div className="mt-3 h-5 w-1/2 animate-pulse bg-[color:var(--muted)]/10" />
      {/* Variant thumbnails */}
      <div className="mt-12 flex gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 w-20 animate-pulse bg-[color:var(--muted)]/10" />
        ))}
      </div>
    </div>
  );
}
