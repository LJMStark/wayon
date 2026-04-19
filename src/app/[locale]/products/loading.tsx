export default function Loading() {
  return (
    <div className="wayon-container px-[15px] py-24">
      <div className="h-10 w-1/3 animate-pulse bg-[color:var(--muted)]/20" />
      <div className="mt-4 h-6 w-2/3 animate-pulse bg-[color:var(--muted)]/10" />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse bg-[color:var(--muted)]/10" />
        ))}
      </div>
    </div>
  );
}
