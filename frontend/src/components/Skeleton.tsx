import { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  count?: number;
}

/**
 * Skeleton Loading Component
 * Provides placeholder UI while content is loading
 */
export function Skeleton({
  variant = 'rectangular',
  width,
  height,
  count = 1,
  className = '',
  ...props
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-gray-200';

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const style = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  const skeletonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className={skeletonClasses} style={style} {...props} />
        ))}
      </div>
    );
  }

  return <div className={skeletonClasses} style={style} {...props} />;
}

/**
 * Pre-built skeleton for card layouts
 */
export function SkeletonCard() {
  return (
    <div className="card space-y-4">
      <Skeleton variant="rounded" height={200} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <div className="space-y-2">
        <Skeleton variant="text" count={3} />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for table rows
 */
export function SkeletonTable({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="flex-1">
              <Skeleton variant="text" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Pre-built skeleton for list items
 */
export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center gap-4">
          <Skeleton variant="circular" width={48} height={48} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Pre-built skeleton for user profile
 */
export function SkeletonProfile() {
  return (
    <div className="card space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={80} height={80} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="50%" height={24} />
          <Skeleton variant="text" width="30%" />
        </div>
      </div>
      <div className="space-y-3">
        <Skeleton variant="text" count={4} />
      </div>
    </div>
  );
}

/**
 * Pre-built skeleton for dashboard stats
 */
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" height={32} />
        </div>
      ))}
    </div>
  );
}
