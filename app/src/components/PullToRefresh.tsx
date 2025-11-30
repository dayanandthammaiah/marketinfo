import { useRef, useState } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  threshold?: number; // pixels required to trigger
  containerSelector?: string; // CSS selector for scroll container
  children: React.ReactNode;
}

export function PullToRefresh({ onRefresh, threshold = 72, containerSelector, children }: PullToRefreshProps) {
  const startY = useRef<number | null>(null);
  const pulling = useRef(false);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (refreshing) return;
    const container = containerSelector ? document.querySelector(containerSelector) as HTMLElement | null : null;
    const scrollTop = container ? container.scrollTop : (document.scrollingElement?.scrollTop || 0);
    if (scrollTop > 0) return; // Only start from top of scroll container or page
    startY.current = e.touches[0].clientY;
    pulling.current = true;
  };

  const handleTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!pulling.current || refreshing || startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) {
      e.preventDefault();
      // ease-out cubic for smoother pull curve
      const eased = threshold * 2 * (1 - Math.pow(1 - Math.min(dy / (threshold * 2), 1), 3));
      setOffset(eased);
    }
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = async () => {
    if (!pulling.current || refreshing) return;
    pulling.current = false;

    if (offset >= threshold) {
      try {
        setRefreshing(true);
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }

    // Reset
    setOffset(0);
    startY.current = null;
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
      style={{ touchAction: 'none' }}
    >
      <div
        className="sticky top-0 z-30 flex items-center justify-center h-0"
        aria-hidden
        style={{ transform: `translateY(${offset}px)` }}
      >
        <div className="flex items-center gap-2 text-xs font-medium text-muted">
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 20v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.93 4.93l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17.66 17.66l1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M2 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M20 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4.93 19.07l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          {refreshing ? 'Refreshing...' : offset >= threshold ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      </div>
      <div style={{ transform: `translateY(${offset}px)`, transition: pulling.current ? 'none' : 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)' }}>
        {children}
      </div>
    </div>
  );
}
