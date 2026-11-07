import { useCallback, useEffect, useRef, useState } from 'react';

import { type LoadStatus, toError } from '../lib/asyncState';

interface AsyncDataState<T> {
  data: T | null;
  status: LoadStatus;
  error: Error | null;
}

export interface UseAsyncDataResult<T> extends AsyncDataState<T> {
  isLoading: boolean;
  reload: () => Promise<void>;
}

export function useAsyncData<T>(fetcher: () => Promise<T>): UseAsyncDataResult<T> {
  const [state, setState] = useState<AsyncDataState<T>>({
    data: null,
    status: 'loading',
    error: null,
  });
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;

    const requestId = ++requestIdRef.current;

    fetcher().then(
      (data) => {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        setState({ data, status: 'success', error: null });
      },
      (error: unknown) => {
        if (!mountedRef.current || requestId !== requestIdRef.current) {
          return;
        }

        setState({ data: null, status: 'error', error: toError(error) });
      },
    );

    return () => {
      mountedRef.current = false;
    };
  }, [fetcher]);

  const reload = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;

    setState((previous) => ({ ...previous, status: 'loading', error: null }));

    try {
      const data = await fetcher();

      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setState({ data, status: 'success', error: null });
    } catch (error) {
      if (!mountedRef.current || requestId !== requestIdRef.current) {
        return;
      }

      setState((previous) => ({
        data: previous.data,
        status: previous.data === null ? 'error' : 'success',
        error: toError(error),
      }));
    }
  }, [fetcher]);

  return {
    ...state,
    isLoading: state.status === 'loading',
    reload,
  };
}
