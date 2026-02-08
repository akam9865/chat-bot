export function ChatSkeleton() {
  return (
    <div className="flex flex-col h-full w-full p-4 animate-pulse">
      <div className="flex-1 flex flex-col justify-end gap-4 py-4">
        <div className="self-end h-10 w-48 bg-neutral-200 rounded-lg" />
        <div className="self-start h-16 w-64 bg-neutral-100 rounded-lg" />
        <div className="self-end h-10 w-36 bg-neutral-200 rounded-lg" />
        <div className="self-start h-20 w-72 bg-neutral-100 rounded-lg" />
      </div>

      <div className="h-10 w-full bg-neutral-200 rounded-md" />
    </div>
  );
}
