export default function Loading() {
  return (
    <div className="wayon-container px-[15px] py-24">
      <div className="h-10 w-1/3 animate-pulse bg-[color:var(--muted)]/20" />
      <div className="mt-4 h-6 w-1/2 animate-pulse bg-[color:var(--muted)]/10" />
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-3">
            <div className="aspect-[16/9] w-full animate-pulse bg-[color:var(--muted)]/10" />
            <div className="h-5 w-3/4 animate-pulse bg-[color:var(--muted)]/20" />
            <div className="h-4 w-full animate-pulse bg-[color:var(--muted)]/10" />
            <div className="h-4 w-2/3 animate-pulse bg-[color:var(--muted)]/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
