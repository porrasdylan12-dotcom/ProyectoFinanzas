import { Preferences } from '@capacitor/preferences';

export const CACHE_PREFIX = 'proyecto-finanzas:cache:v1:';

export const SESSION_USER_KEY = 'session:user';

function cacheKey(key: string): string {
  return `${CACHE_PREFIX}${key}`;
}

export async function readCache<T>(key: string): Promise<T | null> {
  try {
    const { value } = await Preferences.get({ key: cacheKey(key) });

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, value: T): Promise<void> {
  try {
    await Preferences.set({
      key: cacheKey(key),
      value: JSON.stringify(value),
    });
  } catch {
    // La caché es opcional: un fallo de almacenamiento no debe romper la app.
  }
}

export async function clearOfflineCache(): Promise<void> {
  try {
    const { keys } = await Preferences.keys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));

    await Promise.all(cacheKeys.map((key) => Preferences.remove({ key })));
  } catch {
    // La sesión debe cerrarse aunque el almacenamiento local falle.
  }
}
