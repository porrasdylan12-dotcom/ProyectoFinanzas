import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../lib/apiClient';
import { readCache, writeCache } from '../lib/offlineCache';

import { useAsyncData } from './useAsyncData';

vi.mock('../lib/offlineCache', () => ({
  readCache: vi.fn(),
  writeCache: vi.fn(),
}));

const readCached = vi.mocked(readCache);
const writeCached = vi.mocked(writeCache);

describe('useAsyncData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    readCached.mockResolvedValue(null);
    writeCached.mockResolvedValue();
  });

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

  it('mantiene los datos mientras recarga', async () => {
    let resolveReload: ((value: string) => void) | undefined;

    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('primero')
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveReload = resolve;
          }),
      );

    const { result } = renderHook(() => useAsyncData(fetcher));

    await waitFor(() => expect(result.current.data).toBe('primero'));

    act(() => {
      void result.current.reload();
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.data).toBe('primero');

    await act(async () => {
      resolveReload?.('segundo');
    });

    await waitFor(() => expect(result.current.data).toBe('segundo'));
  });

  it('conserva los datos si falla una recarga', async () => {
    const fetcher = vi
      .fn<() => Promise<string>>()
      .mockResolvedValueOnce('primero')
      .mockRejectedValueOnce(new Error('Sin conexión'));

    const { result } = renderHook(() => useAsyncData(fetcher));

    await waitFor(() => expect(result.current.data).toBe('primero'));

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.data).toBe('primero');
    expect(result.current.status).toBe('success');
    expect(result.current.error?.message).toBe('Sin conexión');
  });

  it('guarda los datos en la caché cuando se indica una clave', async () => {
    const fetcher = vi.fn(async () => ({ id: 1 }));

    const { result } = renderHook(() => useAsyncData(fetcher, { cacheKey: 'panel' }));

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(writeCached).toHaveBeenCalledWith('panel', { id: 1 });
  });

  it('usa la caché si la carga inicial falla por falta de red', async () => {
    const fetcher = vi.fn(async () => {
      throw new ApiError(0, 'NETWORK_ERROR', 'Sin conexión');
    });
    readCached.mockResolvedValue({ id: 9 });

    const { result } = renderHook(() => useAsyncData(fetcher, { cacheKey: 'panel' }));

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(result.current.data).toEqual({ id: 9 });
    expect(result.current.error?.message).toBe('Sin conexión');
    expect(readCached).toHaveBeenCalledWith('panel');
  });

  it('no usa la caché ante errores que no son de red', async () => {
    const fetcher = vi.fn(async () => {
      throw new ApiError(500, 'HTTP_500', 'Error del servidor');
    });
    readCached.mockResolvedValue({ id: 9 });

    const { result } = renderHook(() => useAsyncData(fetcher, { cacheKey: 'panel' }));

    await waitFor(() => expect(result.current.status).toBe('error'));

    expect(result.current.data).toBeNull();
    expect(readCached).not.toHaveBeenCalled();
  });
});
