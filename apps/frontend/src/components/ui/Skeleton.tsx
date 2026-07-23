interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-[6px] bg-canvas-soft-2 ${className}`}
    />
  );
}
