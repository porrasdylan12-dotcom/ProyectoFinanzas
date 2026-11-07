import { useCallback, useEffect, useRef, useState } from 'react';

import { type LoadStatus, toError } from '../lib/asyncState';
import { type PaginatedResponse, hasNextPage } from '../lib/pagination';

const DEFAULT_PAGE_SIZE = 20;

export interface UseInfiniteListOptions {
  perPage?: number;
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
  { perPage = DEFAULT_PAGE_SIZE }: UseInfiniteListOptions = {},
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

  useEffect(() => {
    mountedRef.current = true;

    const requestId = ++requestIdRef.current;

    loadingRef.current = true;

    fetchPage(1, perPage)
      .then((response) => {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        itemsCountRef.current = response.data.length;
        setItems(response.data);
        pageRef.current = response.meta.current_page;
        setHasMore(hasNextPage(response.meta));
        setStatus('success');
        setError(null);
        loadingRef.current = false;
      })
      .catch((loadError: unknown) => {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        setError(toError(loadError));
        setStatus('error');
        loadingRef.current = false;
      });

    return () => {
      mountedRef.current = false;
    };
  }, [fetchPage, perPage]);

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

      itemsCountRef.current += response.data.length;
      setItems((currentItems) => [...currentItems, ...response.data]);
      pageRef.current = response.meta.current_page;
      setHasMore(hasNextPage(response.meta));
      setStatus('success');
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
  }, [fetchPage, hasMore, perPage]);

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
      setItems(response.data);
      pageRef.current = response.meta.current_page;
      setHasMore(hasNextPage(response.meta));
      setStatus('success');
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
  }, [fetchPage, perPage]);

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
