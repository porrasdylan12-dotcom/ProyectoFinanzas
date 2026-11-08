import { useCallback, useEffect, useRef, useState } from 'react';

import { type LoadStatus, isNetworkError, toError } from '../lib/asyncState';
import { readCache, writeCache } from '../lib/offlineCache';

interface AsyncDataState<T> {
  data: T | null;
  status: LoadStatus;
  error: Error | null;
}

export interface UseAsyncDataOptions {
  cacheKey?: string;
}

export interface UseAsyncDataResult<T> extends AsyncDataState<T> {
  isLoading: boolean;
  reload: () => Promise<void>;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  { cacheKey }: UseAsyncDataOptions = {},
): UseAsyncDataResult<T> {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    status: 'loading',
    error: null,
  });
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const stateRef = useRef(state);

  stateRef.current = state;

  useEffect(() => {
    mountedRef.current = true;

    const requestId = ++requestIdRef.current;

    const load = async (): Promise<void> => {
      try {
        const data = await fetcher();

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        setState({ data, status: 'success', error: null });

        if (cacheKey) {
          await writeCache(cacheKey, data);
        }
      } catch (error) {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        if (cacheKey && isNetworkError(error)) {
          const cached = await readCache<T>(cacheKey);

          if (!mountedRef.current || requestId !== requestIdRef.current) {
            return;
          }

          if (cached !== null) {
            setState({ data: cached, status: 'success', error: toError(error) });
            return;
          }
        }

        setState({ data: null, status: 'error', error: toError(error) });
      }
    };

    void load();

    return () => {
      mountedRef.current = false;
    };
  }, [cacheKey, fetcher]);

  const reload = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;

    setState((previous) => ({ ...previous, status: 'loading', error: null }));

    try {
      const data = await fetcher();

      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setState({ data, status: 'success', error: null });

      if (cacheKey) {
        await writeCache(cacheKey, data);
      }
    } catch (error) {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      if (cacheKey && stateRef.current.data === null && isNetworkError(error)) {
        const cached = await readCache<T>(cacheKey);

        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        if (cached !== null) {
          setState({ data: cached, status: 'success', error: toError(error) });
          return;
        }
      }

      setState((previous) => ({
        data: previous.data,
        status: previous.data === null ? 'error' : 'success',
        error: toError(error),
      }));
    }
  }, [cacheKey, fetcher]);

  return {
    ...state,
    isLoading: state.status === 'loading',
    reload,
  };
}
