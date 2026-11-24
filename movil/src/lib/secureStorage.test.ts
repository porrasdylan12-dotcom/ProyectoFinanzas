import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { tokenStore } from './secureStorage';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: vi.fn() },
}));

vi.mock('@aparajita/capacitor-secure-storage', () => ({
  SecureStorage: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

const isNativePlatform = vi.mocked(Capacitor.isNativePlatform);
const secureGet = vi.mocked(SecureStorage.get);
const secureSet = vi.mocked(SecureStorage.set);
const secureRemove = vi.mocked(SecureStorage.remove);

describe('tokenStore', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    isNativePlatform.mockReturnValue(false);
    await tokenStore.clear();
  });

  it('guarda y lee el token en memoria cuando no es nativo', async () => {
    await tokenStore.set('token-web');

    await expect(tokenStore.get()).resolves.toBe('token-web');
    expect(secureSet).not.toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
  });

  it('elimina el token de memoria', async () => {
    await tokenStore.set('token-web');
    await tokenStore.clear();

    await expect(tokenStore.get()).resolves.toBeNull();
  });

  it('usa el almacenamiento cifrado cuando es nativo', async () => {
    isNativePlatform.mockReturnValue(true);
    secureGet.mockResolvedValue('token-nativo');

    await expect(tokenStore.get()).resolves.toBe('token-nativo');
    expect(secureGet).toHaveBeenCalledWith('auth_token');

    await tokenStore.set('token-nuevo');
    expect(secureSet).toHaveBeenCalledWith('auth_token', 'token-nuevo');

    await tokenStore.clear();
    expect(secureRemove).toHaveBeenCalledWith('auth_token');
  });

  it('devuelve null si el valor almacenado no es una cadena', async () => {
    isNativePlatform.mockReturnValue(true);
    secureGet.mockResolvedValue(42);

    await expect(tokenStore.get()).resolves.toBeNull();
  });

  it('devuelve null si el almacenamiento cifrado falla', async () => {
    isNativePlatform.mockReturnValue(true);
    secureGet.mockRejectedValue(new Error('almacenamiento no disponible'));

    await expect(tokenStore.get()).resolves.toBeNull();
  });
});
