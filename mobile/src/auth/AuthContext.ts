import { createContext, useContext } from 'react';

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  creada?: string;
  actualizada?: string;
}

export type AuthStatus = 'loading' | 'authenticated' | 'guest';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ProfilePayload {
  name: string;
  email: string;
}

export interface PasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  updateProfile: (payload: ProfilePayload) => Promise<void>;
  changePassword: (payload: PasswordPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider.');
  }

  return context;
}
