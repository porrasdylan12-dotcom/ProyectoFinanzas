import { SecureStorage } from '@aparajita/capacitor-secure-storage';
import { Capacitor } from '@capacitor/core';

const TOKEN_KEY = 'auth_token';

/**
 * Token en memoria para desarrollo web. Nunca se persiste en el navegador:
 * en nativo se usa el almacenamiento cifrado de Capacitor.
 */
let memoryToken: string | null = null;

export interface TokenStore {
  get: () => Promise<string | null>;
  set: (token: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const tokenStore: TokenStore = {
  async get(): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      return memoryToken;
    }

    try {
      const stored = await SecureStorage.get(TOKEN_KEY);
      return typeof stored === 'string' ? stored : null;
    } catch {
      // Un fallo de lectura se trata como sesión inexistente.
      return null;
    }
  },

  async set(token: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      memoryToken = token;
      return;
    }

    await SecureStorage.set(TOKEN_KEY, token);
  },

  async clear(): Promise<void> {
    memoryToken = null;

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    await SecureStorage.remove(TOKEN_KEY);
  },
};
