export function SidebarSkeleton() {
  return (
    <div className="w-72 shrink-0 h-full min-h-0 border border-neutral-200 p-4 animate-pulse">
      <div className="h-5 w-20 bg-neutral-200 rounded-md" />
      <div className="h-4 w-24 bg-neutral-200 rounded-md mt-6 mb-4" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-5 bg-neutral-200 rounded-md"
            style={{ width: `${60 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    </div>
  );
}
