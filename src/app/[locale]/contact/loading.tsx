export default function Loading() {
  return (
    <div className="wayon-container px-[15px] py-24">
      <div className="h-10 w-1/3 animate-pulse bg-[color:var(--muted)]/20" />
      <div className="mt-4 h-5 w-1/2 animate-pulse bg-[color:var(--muted)]/10" />
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        {/* Form skeleton */}
        <div className="flex flex-col gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 w-full animate-pulse bg-[color:var(--muted)]/10" />
          ))}
          <div className="h-32 w-full animate-pulse bg-[color:var(--muted)]/10" />
          <div className="h-12 w-1/3 animate-pulse bg-[color:var(--muted)]/20" />
        </div>
        {/* Map skeleton */}
        <div className="aspect-square animate-pulse bg-[color:var(--muted)]/10 md:aspect-auto" />
      </div>
    </div>
  );
}
