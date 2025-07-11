import { useState, useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollProps {
  fetchMore: (page: number) => Promise<{ hasMore: boolean; data: any[] }>;
  initialPage?: number;
  threshold?: number;
}

interface UseInfiniteScrollReturn {
  data: any[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  setData: (data: any[]) => void;
  setLoadingRef: (node: HTMLDivElement | null) => void;
}

export const useInfiniteScroll = ({
  fetchMore,
  initialPage = 1,
  threshold = 100,
}: UseInfiniteScrollProps): UseInfiniteScrollReturn => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);
  const [initialLoad, setInitialLoad] = useState(true);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      setError(null);

      const result = await fetchMore(page);

      if (result.data.length === 0) {
        setHasMore(false);
      } else {
        setData((prevData) => [...prevData, ...result.data]);
        setHasMore(result.hasMore);
        setPage((prevPage) => prevPage + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more data");
    } finally {
      setLoading(false);
    }
  }, [fetchMore, page, loading, hasMore]);

  const reset = useCallback(() => {
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
    setInitialLoad(true);
  }, [initialPage]);

  // Initial load
  useEffect(() => {
    if (initialLoad) {
      setInitialLoad(false);
      loadMore();
    }
  }, [initialLoad, loadMore]);

  // Intersection Observer setup
  useEffect(() => {
    if (!loadingRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`,
      }
    );

    observerRef.current = observer;
    observer.observe(loadingRef.current);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, loading, hasMore, threshold]);

  const setLoadingRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingRef.current && observerRef.current) {
      observerRef.current.unobserve(loadingRef.current);
    }

    loadingRef.current = node;

    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    reset,
    setData,
    setLoadingRef,
  };
};
