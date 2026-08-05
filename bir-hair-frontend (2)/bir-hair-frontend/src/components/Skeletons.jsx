
export function ProductCardSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-shimmer skeleton-img" />
      <div className="skeleton-shimmer skeleton-line" style={{ width: '80%' }} />
      <div className="skeleton-shimmer skeleton-line" style={{ width: '50%' }} />
      <div className="skeleton-shimmer skeleton-line" style={{ width: '35%' }} />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function LineSkeleton({ width = '100%', height = 16 }) {
  return <div className="skeleton-shimmer skeleton-line" style={{ width, height }} />;
}

export function BlockSkeleton({ height = 200 }) {
  return <div className="skeleton-shimmer skeleton-img" style={{ height, width: '100%' }} />;
}
