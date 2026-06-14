/** Base animated pulse box */
export function SkeletonBox({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#E8ECF0] dark:bg-slate-700 ${className}`}
    />
  );
}

/** Card-shaped skeleton */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`card ${className}`}>
      <SkeletonBox className="h-5 w-2/3 mb-3" />
      <SkeletonBox className="h-4 w-full mb-2" />
      <SkeletonBox className="h-4 w-3/4 mb-4" />
      <div className="flex gap-2">
        <SkeletonBox className="h-6 w-14 rounded-full" />
        <SkeletonBox className="h-6 w-10 rounded-full" />
      </div>
    </div>
  );
}

/** Case card skeleton */
export function SkeletonCaseCard() {
  return (
    <div className="card flex flex-col">
      <SkeletonBox className="h-28 w-full mb-4" />
      <div className="flex gap-2 mb-3">
        <SkeletonBox className="h-5 w-12 rounded-full" />
        <SkeletonBox className="h-5 w-10 rounded-full" />
      </div>
      <SkeletonBox className="h-5 w-3/4 mb-2" />
      <SkeletonBox className="h-4 w-full mb-1" />
      <SkeletonBox className="h-4 w-2/3 mb-3" />
      <div className="flex gap-1.5 mb-3">
        <SkeletonBox className="h-5 w-24" />
        <SkeletonBox className="h-5 w-16" />
      </div>
      <div className="flex justify-between mb-4">
        <SkeletonBox className="h-4 w-16" />
        <SkeletonBox className="h-4 w-20" />
      </div>
      <SkeletonBox className="h-10 w-full rounded-[10px]" />
    </div>
  );
}

/** Full-page loading skeleton */
export function SkeletonPage({
  variant = "card",
  count = 3,
  cols = "md:grid-cols-2 lg:grid-cols-3",
}: {
  variant?: "card" | "case" | "list";
  count?: number;
  cols?: string;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <SkeletonBox className="h-8 w-48 mb-2" />
      <SkeletonBox className="h-5 w-80 mb-8" />
      {variant === "case" ? (
        <div className={`grid ${cols} gap-6`}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCaseCard key={i} />
          ))}
        </div>
      ) : (
        <div className={`grid ${cols} gap-6`}>
          {Array.from({ length: count }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
}
