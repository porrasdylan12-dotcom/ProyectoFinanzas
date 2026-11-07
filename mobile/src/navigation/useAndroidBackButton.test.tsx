import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { act, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveBackAction, useAndroidBackButton } from './useAndroidBackButton';

vi.mock('@capacitor/core', () => ({
  Capacitor: { getPlatform: vi.fn(() => 'android') },
}));

vi.mock('@capacitor/app', () => ({
  App: {
    addListener: vi.fn(),
    exitApp: vi.fn(async () => undefined),
  },
}));

const addListenerMock = vi.mocked(App.addListener);
const exitAppMock = vi.mocked(App.exitApp);

const Probe: React.FC = () => {
  useAndroidBackButton();
  const location = useLocation();

  return <span data-testid="path">{location.pathname}</span>;
};

function renderAt(path: string, previousPath?: string) {
  const entries = previousPath ? [previousPath, path] : [path];

  return render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <Probe />
    </MemoryRouter>,
  );
}

describe('resolveBackAction', () => {
  it('sale solo desde el panel', () => {
    expect(resolveBackAction('/panel', false)).toBe('exit');
    expect(resolveBackAction('/panel', true)).toBe('exit');
  });

  it('vuelve al panel desde otra raíz de tabs', () => {
    expect(resolveBackAction('/cuentas', true)).toBe('panel');
    expect(resolveBackAction('/grupos', true)).toBe('panel');
    expect(resolveBackAction('/ajustes', true)).toBe('panel');
  });

  it('retrocede en detalles y cae al panel sin historial', () => {
    expect(resolveBackAction('/cuentas/1', true)).toBe('back');
    expect(resolveBackAction('/cuentas/1', false)).toBe('panel');
  });
});

describe('useAndroidBackButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(Capacitor.getPlatform).mockReturnValue('android');
  });

  it('no registra el listener fuera de Android', async () => {
    vi.mocked(Capacitor.getPlatform).mockReturnValue('web');

    renderAt('/panel');

    await waitFor(() => expect(addListenerMock).not.toHaveBeenCalled());
  });

  it('sale de la app desde el panel', async () => {
    let handler: ((event: { canGoBack: boolean }) => void) | undefined;

    addListenerMock.mockImplementation(async (_eventName, listener) => {
      handler = listener as (event: { canGoBack: boolean }) => void;
      return { remove: vi.fn(async () => undefined) };
    });

    renderAt('/panel');

    await waitFor(() => expect(handler).toBeDefined());
    act(() => handler?.({ canGoBack: false }));

    expect(exitAppMock).toHaveBeenCalledTimes(1);
  });

  it('navega al panel desde otra raíz', async () => {
    let handler: ((event: { canGoBack: boolean }) => void) | undefined;

    addListenerMock.mockImplementation(async (_eventName, listener) => {
      handler = listener as (event: { canGoBack: boolean }) => void;
      return { remove: vi.fn(async () => undefined) };
    });

    renderAt('/cuentas');

    await waitFor(() => expect(handler).toBeDefined());
    act(() => handler?.({ canGoBack: true }));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/panel'));
    expect(exitAppMock).not.toHaveBeenCalled();
  });

  it('retrocede en un detalle', async () => {
    let handler: ((event: { canGoBack: boolean }) => void) | undefined;

    addListenerMock.mockImplementation(async (_eventName, listener) => {
      handler = listener as (event: { canGoBack: boolean }) => void;
      return { remove: vi.fn(async () => undefined) };
    });

    renderAt('/cuentas/1', '/panel');

    await waitFor(() => expect(handler).toBeDefined());
    act(() => handler?.({ canGoBack: true }));

    await waitFor(() => expect(screen.getByTestId('path')).toHaveTextContent('/panel'));
    expect(exitAppMock).not.toHaveBeenCalled();
  });

  it('elimina el listener al desmontar', async () => {
    const remove = vi.fn(async () => undefined);

    addListenerMock.mockResolvedValue({ remove });

    const { unmount } = renderAt('/panel');

    await waitFor(() => expect(addListenerMock).toHaveBeenCalledTimes(1));
    unmount();

    expect(remove).toHaveBeenCalledTimes(1);
  });
});
