import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CACHE_PREFIX, clearOfflineCache, readCache, writeCache } from './offlineCache';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    keys: vi.fn(),
    remove: vi.fn(),
  },
}));

const getPreference = vi.mocked(Preferences.get);
const setPreference = vi.mocked(Preferences.set);
const keysPreference = vi.mocked(Preferences.keys);
const removePreference = vi.mocked(Preferences.remove);

describe('offlineCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('guarda y lee valores serializados con el prefijo de la app', async () => {
    setPreference.mockResolvedValue();
    getPreference.mockResolvedValue({ value: JSON.stringify({ id: 1 }) });

    await writeCache('panel', { id: 1 });

    expect(setPreference).toHaveBeenCalledWith({
      key: `${CACHE_PREFIX}panel`,
      value: JSON.stringify({ id: 1 }),
    });

    await expect(readCache('panel')).resolves.toEqual({ id: 1 });
    expect(getPreference).toHaveBeenCalledWith({ key: `${CACHE_PREFIX}panel` });
  });

  it('devuelve null si no hay caché o está corrupta', async () => {
    getPreference.mockResolvedValueOnce({ value: null }).mockResolvedValueOnce({ value: '{invalido' });

    await expect(readCache('panel')).resolves.toBeNull();
    await expect(readCache('panel')).resolves.toBeNull();
  });

  it('ignora fallos de almacenamiento', async () => {
    setPreference.mockRejectedValue(new Error('sin espacio'));
    getPreference.mockRejectedValue(new Error('no disponible'));

    await expect(writeCache('panel', { id: 1 })).resolves.toBeUndefined();
    await expect(readCache('panel')).resolves.toBeNull();
  });

  it('elimina solo las claves de caché de la app', async () => {
    keysPreference.mockResolvedValue({
      keys: [`${CACHE_PREFIX}panel`, `${CACHE_PREFIX}accounts`, 'otra-clave'],
    });
    removePreference.mockResolvedValue();

    await clearOfflineCache();

    expect(removePreference).toHaveBeenCalledTimes(2);
    expect(removePreference).toHaveBeenCalledWith({ key: `${CACHE_PREFIX}panel` });
    expect(removePreference).toHaveBeenCalledWith({ key: `${CACHE_PREFIX}accounts` });
    expect(removePreference).not.toHaveBeenCalledWith({ key: 'otra-clave' });
  });
});
