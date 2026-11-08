import { Network, type ConnectionStatusChangeListener } from '@capacitor/network';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNetworkStatus } from './useNetworkStatus';

vi.mock('@capacitor/network', () => ({
  Network: {
    getStatus: vi.fn(),
    addListener: vi.fn(),
  },
}));

const getStatus = vi.mocked(Network.getStatus);
const addListener = vi.mocked(Network.addListener);

describe('useNetworkStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getStatus.mockResolvedValue({ connected: true, connectionType: 'wifi' });
    addListener.mockResolvedValue({ remove: vi.fn() });
  });

  it('consulta el estado inicial y escucha los cambios de red', async () => {
    let listener: ConnectionStatusChangeListener | undefined;
    addListener.mockImplementation(async (_event, callback) => {
      listener = callback;

      return { remove: vi.fn() };
    });

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => expect(result.current).toBe(true));

    act(() => listener?.({ connected: false, connectionType: 'none' }));

    expect(result.current).toBe(false);
  });

  it('elimina el listener al desmontar', async () => {
    const remove = vi.fn();
    addListener.mockResolvedValue({ remove });

    const { unmount } = renderHook(() => useNetworkStatus());

    await waitFor(() => expect(addListener).toHaveBeenCalledOnce());

    unmount();

    expect(remove).toHaveBeenCalledOnce();
  });

  it('mantiene el estado del navegador si falla la consulta inicial', async () => {
    getStatus.mockRejectedValue(new Error('No disponible'));

    const { result } = renderHook(() => useNetworkStatus());

    await waitFor(() => expect(addListener).toHaveBeenCalledOnce());

    expect(result.current).toBe(navigator.onLine);
  });
});
