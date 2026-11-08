import { useCallback, useEffect, useRef, useState } from 'react';

import { type LoadStatus, isNetworkError, toError } from '../lib/asyncState';
import { readCache, writeCache } from '../lib/offlineCache';
import { type PaginatedResponse, hasNextPage } from '../lib/pagination';

const DEFAULT_PAGE_SIZE = 20;

interface CachedList<T> {
  items: T[];
}

export interface UseInfiniteListOptions {
  perPage?: number;
  cacheKey?: string;
}

export interface UseInfiniteListResult<T> {
  items: T[];
  status: LoadStatus;
  error: Error | null;
  hasMore: boolean;
  isEmpty: boolean;
  isInitialLoading: boolean;
  isLoadingMore: boolean;
  isRefreshing: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useInfiniteList<T>(
  fetchPage: (page: number, perPage: number) => Promise<PaginatedResponse<T>>,
  { perPage = DEFAULT_PAGE_SIZE, cacheKey }: UseInfiniteListOptions = {},
): UseInfiniteListResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const itemsCountRef = useRef(0);
  const itemsRef = useRef<T[]>([]);

  const saveItems = useCallback(
    async (nextItems: T[]): Promise<void> => {
      if (cacheKey) {
        await writeCache(cacheKey, { items: nextItems } satisfies CachedList<T>);
      }
    },
    [cacheKey],
  );

  useEffect(() => {
    mountedRef.current = true;

    const requestId = ++requestIdRef.current;

    loadingRef.current = true;

    const load = async (): Promise<void> => {
      try {
        const response = await fetchPage(1, perPage);

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        itemsCountRef.current = response.data.length;
        itemsRef.current = response.data;
        setItems(response.data);
        pageRef.current = response.meta.current_page;
        setHasMore(hasNextPage(response.meta));
        setStatus('success');
        setError(null);
        loadingRef.current = false;

        await saveItems(response.data);
      } catch (loadError) {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        if (cacheKey && isNetworkError(loadError)) {
          const cached = await readCache<CachedList<T>>(cacheKey);

          if (!mountedRef.current || requestId !== requestIdRef.current) {
            return;
          }

          if (cached !== null && Array.isArray(cached.items)) {
            itemsCountRef.current = cached.items.length;
            itemsRef.current = cached.items;
            setItems(cached.items);
            pageRef.current = 1;
            setHasMore(false);
            setStatus('success');
            setError(toError(loadError));
            loadingRef.current = false;
            return;
          }
        }

        setError(toError(loadError));
        setStatus('error');
        loadingRef.current = false;
      }
    };

    void load();

    return () => {
      mountedRef.current = false;
    };
  }, [cacheKey, fetchPage, perPage, saveItems]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (loadingRef.current || !hasMore) {
      return;
    }

    const requestId = requestIdRef.current;
    const nextPage = pageRef.current + 1;

    loadingRef.current = true;
    setIsLoadingMore(true);
    setError(null);

    try {
      const response = await fetchPage(nextPage, perPage);

      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      const nextItems = [...itemsRef.current, ...response.data];
      itemsCountRef.current = nextItems.length;
      itemsRef.current = nextItems;
      setItems(nextItems);
      pageRef.current = response.meta.current_page;
      setHasMore(hasNextPage(response.meta));
      setStatus('success');

      await saveItems(nextItems);
    } catch (loadError) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setError(toError(loadError));
      }
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [fetchPage, hasMore, perPage, saveItems]);

  const refresh = useCallback(async (): Promise<void> => {
    if (loadingRef.current) {
      return;
    }

    const requestId = ++requestIdRef.current;

    loadingRef.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetchPage(1, perPage);

      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      itemsCountRef.current = response.data.length;
      itemsRef.current = response.data;
      setItems(response.data);
      pageRef.current = response.meta.current_page;
      setHasMore(hasNextPage(response.meta));
      setStatus('success');

      await saveItems(response.data);
    } catch (loadError) {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setError(toError(loadError));
      setStatus(itemsCountRef.current === 0 ? 'error' : 'success');
    } finally {
      if (requestId === requestIdRef.current) {
        loadingRef.current = false;
        setIsRefreshing(false);
      }
    }
  }, [fetchPage, perPage, saveItems]);

  return {
    items,
    status,
    error,
    hasMore,
    isEmpty: status === 'success' && items.length === 0,
    isInitialLoading: status === 'loading',
    isLoadingMore,
    isRefreshing,
    loadMore,
    refresh,
  };
}
