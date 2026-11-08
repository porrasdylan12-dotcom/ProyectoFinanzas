import { useCallback, useEffect, useState, type PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';

import { apiClient } from '../lib/apiClient';
import { isNetworkError } from '../lib/asyncState';
import { SESSION_USER_KEY, clearOfflineCache, readCache, writeCache } from '../lib/offlineCache';
import { updateMyPassword, updateMyProfile } from '../lib/profile';
import { tokenStore } from '../lib/secureStorage';

import {
  AuthContext,
  type AuthStatus,
  type AuthUser,
  type LoginCredentials,
  type PasswordPayload,
  type ProfilePayload,
  type RegisterPayload,
} from './AuthContext';

interface AuthResponse {
  user: AuthUser;
  token: string;
}

/** Los recursos de Laravel se envuelven en `data` cuando son la respuesta raíz. */
interface UserResponse {
  data: AuthUser;
}

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const navigate = useNavigate();

  const startSession = useCallback(async (result: AuthResponse): Promise<void> => {
    await tokenStore.set(result.token);
    await clearOfflineCache();
    await writeCache(SESSION_USER_KEY, result.user);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const login = useCallback(
    async ({ email, password }: LoginCredentials): Promise<void> => {
      const result = await apiClient.post<AuthResponse>('/login', { email, password }, { auth: false });

      await startSession(result);
    },
    [startSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<void> => {
      const result = await apiClient.post<AuthResponse>('/register', payload, { auth: false });

      await startSession(result);
    },
    [startSession],
  );

  const updateProfile = useCallback(async (payload: ProfilePayload): Promise<void> => {
    const updated = await updateMyProfile(payload);

    await writeCache(SESSION_USER_KEY, updated);
    setUser(updated);
  }, []);

  const changePassword = useCallback(async (payload: PasswordPayload): Promise<void> => {
    await updateMyPassword(payload);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await apiClient.post('/logout');
    } catch {
      // La sesión local se cierra aunque el servidor no responda.
    }

    try {
      await tokenStore.clear();
    } catch {
      // La navegación a Login no debe depender del almacenamiento nativo.
    }

    await clearOfflineCache();
    setUser(null);
    setStatus('guest');
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async (): Promise<void> => {
      const token = await tokenStore.get();

      if (cancelled) {
        return;
      }

      if (!token) {
        setStatus('guest');
        return;
      }

      try {
        const currentUser = await apiClient.get<UserResponse>('/user');

        if (!cancelled) {
          await writeCache(SESSION_USER_KEY, currentUser.data);
          setUser(currentUser.data);
          setStatus('authenticated');
        }
      } catch (error) {
        if (isNetworkError(error)) {
          const cachedUser = await readCache<AuthUser>(SESSION_USER_KEY);

          if (!cancelled && cachedUser !== null) {
            setUser(cachedUser);
            setStatus('authenticated');
            return;
          }
        }

        if (!cancelled) {
          setUser(null);
          setStatus('guest');
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    apiClient.setUnauthorizedHandler(async () => {
      await clearOfflineCache();
      setUser(null);
      setStatus('guest');
      navigate('/login', { replace: true });
    });

    return () => {
      apiClient.setUnauthorizedHandler(null);
    };
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, status, login, register, updateProfile, changePassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
