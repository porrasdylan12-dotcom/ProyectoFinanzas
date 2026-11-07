import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { PaginatedResponse } from '../lib/pagination';

import { useInfiniteList } from './useInfiniteList';

interface Item {
  id: number;
}

function page(data: Item[], currentPage = 1, lastPage = 1): PaginatedResponse<Item> {
  return {
    data,
    meta: {
      current_page: currentPage,
      last_page: lastPage,
      per_page: 20,
      total: data.length,
      from: data.length > 0 ? 1 : null,
      to: data.length > 0 ? data.length : null,
    },
    links: {
      first: null,
      last: null,
      prev: null,
      next: null,
    },
  };
}

describe('useInfiniteList', () => {
  it('carga la primera página', async () => {
    const fetcher = vi.fn(async () => page([{ id: 1 }], 1, 2));

    const { result } = renderHook(() => useInfiniteList(fetcher));

    expect(result.current.isInitialLoading).toBe(true);

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(fetcher).toHaveBeenCalledWith(1, 20);
    expect(result.current.items).toEqual([{ id: 1 }]);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it('agrega la siguiente página con loadMore', async () => {
    const fetcher = vi.fn(async (pageNumber: number) =>
      pageNumber === 1 ? page([{ id: 1 }], 1, 2) : page([{ id: 2 }], 2, 2),
    );

    const { result } = renderHook(() => useInfiniteList(fetcher));

    await waitFor(() => expect(result.current.items).toHaveLength(1));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fetcher).toHaveBeenLastCalledWith(2, 20);
    expect(result.current.items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoadingMore).toBe(false);
  });

  it('no duplica la carga mientras está en curso', async () => {
    let resolveSecondPage: ((value: PaginatedResponse<Item>) => void) | undefined;

    const fetcher = vi
      .fn<() => Promise<PaginatedResponse<Item>>>()
      .mockResolvedValueOnce(page([{ id: 1 }], 1, 2))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecondPage = resolve;
          }),
      );

    const { result } = renderHook(() => useInfiniteList(fetcher));

    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(async () => {
      const firstLoad = result.current.loadMore();
      const secondLoad = result.current.loadMore();

      resolveSecondPage?.(page([{ id: 2 }], 2, 2));
      await Promise.all([firstLoad, secondLoad]);
    });

    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(result.current.items).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it('no pide más páginas cuando ya no hay más', async () => {
    const fetcher = vi.fn(async () => page([{ id: 1 }], 1, 1));

    const { result } = renderHook(() => useInfiniteList(fetcher));

    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('reemplaza los elementos al refrescar', async () => {
    let version = 1;
    const fetcher = vi.fn(async () => page([{ id: version }], 1, 1));

    const { result } = renderHook(() => useInfiniteList(fetcher));

    await waitFor(() => expect(result.current.items).toEqual([{ id: 1 }]));

    version = 2;

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.items).toEqual([{ id: 2 }]);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('mantiene los elementos si falla la carga de otra página', async () => {
    const fetcher = vi
      .fn<() => Promise<PaginatedResponse<Item>>>()
      .mockResolvedValueOnce(page([{ id: 1 }], 1, 2))
      .mockRejectedValueOnce(new Error('Falló la página'));

    const { result } = renderHook(() => useInfiniteList(fetcher));

    await waitFor(() => expect(result.current.status).toBe('success'));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.items).toEqual([{ id: 1 }]);
    expect(result.current.error?.message).toBe('Falló la página');
    expect(result.current.status).toBe('success');
  });

  it('permite reintentar tras un error inicial', async () => {
    const fetcher = vi
      .fn<() => Promise<PaginatedResponse<Item>>>()
      .mockRejectedValueOnce(new Error('Sin conexión'))
      .mockResolvedValueOnce(page([{ id: 1 }], 1, 1));

    const { result } = renderHook(() => useInfiniteList(fetcher));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.error?.message).toBe('Sin conexión');

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.status).toBe('success');
    expect(result.current.items).toEqual([{ id: 1 }]);
    expect(result.current.error).toBeNull();
  });

  it('marca el listado vacío cuando no hay elementos', async () => {
    const fetcher = vi.fn(async () => page([], 1, 1));

    const { result } = renderHook(() => useInfiniteList(fetcher));

    await waitFor(() => expect(result.current.status).toBe('success'));

    expect(result.current.items).toEqual([]);
    expect(result.current.isEmpty).toBe(true);
  });
});
