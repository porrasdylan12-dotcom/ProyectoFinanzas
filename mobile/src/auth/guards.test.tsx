import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { AuthContext, type AuthContextValue } from './AuthContext';
import { GuestOnly, RequireAuth, RootRedirect } from './guards';

const baseValue: AuthContextValue = {
  user: null,
  status: 'guest',
  login: async () => undefined,
  register: async () => undefined,
  logout: async () => undefined,
};

function renderWithSession(path: string, element: ReactNode, value: Partial<AuthContextValue> = {}, state?: unknown) {
  return render(
    <AuthContext.Provider value={{ ...baseValue, ...value }}>
      <MemoryRouter initialEntries={[{ pathname: path, state }]}>
        <Routes>
          <Route path={path} element={element} />
          {path !== '/login' && <Route path="/login" element={<div>Pantalla de login</div>} />}
          {path !== '/panel' && <Route path="/panel" element={<div>Pantalla de panel</div>} />}
          {path !== '/cuentas' && <Route path="/cuentas" element={<div>Pantalla de cuentas</div>} />}
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('RequireAuth', () => {
  it('muestra el contenido cuando hay sesión', () => {
    renderWithSession(
      '/privada',
      <RequireAuth>
        <div>Contenido privado</div>
      </RequireAuth>,
      { status: 'authenticated' },
    );

    expect(screen.getByText('Contenido privado')).toBeInTheDocument();
  });

  it('redirige a login cuando no hay sesión', () => {
    renderWithSession(
      '/privada',
      <RequireAuth>
        <div>Contenido privado</div>
      </RequireAuth>,
    );

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });

  it('muestra la carga mientras se restaura la sesión', () => {
    renderWithSession(
      '/privada',
      <RequireAuth>
        <div>Contenido privado</div>
      </RequireAuth>,
      { status: 'loading' },
    );

    expect(screen.getByText('Cargando sesión…')).toBeInTheDocument();
  });
});

describe('GuestOnly', () => {
  it('muestra el formulario cuando no hay sesión', () => {
    renderWithSession(
      '/login',
      <GuestOnly>
        <div>Formulario de acceso</div>
      </GuestOnly>,
    );

    expect(screen.getByText('Formulario de acceso')).toBeInTheDocument();
  });

  it('redirige al panel cuando ya hay sesión', () => {
    renderWithSession(
      '/login',
      <GuestOnly>
        <div>Formulario de acceso</div>
      </GuestOnly>,
      { status: 'authenticated' },
    );

    expect(screen.getByText('Pantalla de panel')).toBeInTheDocument();
  });

  it('respeta la ruta de origen al autenticarse', () => {
    renderWithSession(
      '/login',
      <GuestOnly>
        <div>Formulario de acceso</div>
      </GuestOnly>,
      { status: 'authenticated' },
      { from: '/cuentas' },
    );

    expect(screen.getByText('Pantalla de cuentas')).toBeInTheDocument();
  });
});

describe('RootRedirect', () => {
  it('envía al panel con sesión iniciada', () => {
    renderWithSession('/', <RootRedirect />, { status: 'authenticated' });

    expect(screen.getByText('Pantalla de panel')).toBeInTheDocument();
  });

  it('envía a login sin sesión', () => {
    renderWithSession('/', <RootRedirect />);

    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
  });
});
