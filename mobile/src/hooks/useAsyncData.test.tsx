import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useAsyncData } from './useAsyncData';

describe('useAsyncData', () => {
  it('carga los datos y pasa a success', async () => {
    const fetcher = vi.fn(async () => ({ id: 1, nombre: 'Efectivo' }));

    const { result } = renderHook(() => useAsyncData(fetcher));

    expect(result.current.status).toBe('loading');
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(result.current.data).toEqual({ id: 1, nombre: 'Efectivo' });
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('expone el error de la petición', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('No se pudo cargar');
    });

    const { result } = renderHook(() => useAsyncData(fetcher));

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.error?.message).toBe('No se pudo cargar');
    expect(result.current.data).toBeNull();
  });

  it('recarga los datos con reload', async () => {
    let call = 0;
    const fetcher = vi.fn(async () => {
      call += 1;
      return call;
    });

    const { result } = renderHook(() => useAsyncData(fetcher));

    await waitFor(() => expect(result.current.data).toBe(1));

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.data).toBe(2);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('ignora la respuesta de una petición anterior', async () => {
    let resolveFirst: ((value: string) => void) | undefined;
    let resolveSecond: ((value: string) => void) | undefined;

    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve;
          }),
      );

    const { result } = renderHook(() => useAsyncData(fetcher));

    act(() => {
      void result.current.reload();
    });

    act(() => resolveSecond?.('segunda'));
    await waitFor(() => expect(result.current.data).toBe('segunda'));

    act(() => resolveFirst?.('primera'));
    expect(result.current.data).toBe('segunda');
  });
});
