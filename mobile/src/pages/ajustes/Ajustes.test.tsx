import { IonApp } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { fireEvent, render, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, type AuthContextValue } from '../../auth/AuthContext';
import { ApiError } from '../../lib/apiClient';

import Ajustes from './Ajustes';

const updateProfile = vi.fn().mockResolvedValue(undefined);
const changePassword = vi.fn().mockResolvedValue(undefined);
const logout = vi.fn().mockResolvedValue(undefined);

const authValue: AuthContextValue = {
  user: { id: 1, nombre: 'Erick', email: 'erick@example.com' },
  status: 'authenticated',
  login: async () => undefined,
  register: async () => undefined,
  updateProfile,
  changePassword,
  logout,
};

function renderAjustes() {
  window.history.replaceState({}, '', '/ajustes');

  return render(
    <AuthContext.Provider value={authValue}>
      <IonApp>
        <IonReactRouter>
          <Routes>
            <Route path="/ajustes" element={<Ajustes />} />
            <Route path="/login" element={<div>Pantalla de login</div>} />
          </Routes>
        </IonReactRouter>
      </IonApp>
    </AuthContext.Provider>,
  );
}

function setInput(testId: string, value: string): void {
  fireEvent(
    screen.getByTestId(testId),
    new CustomEvent('ionInput', {
      detail: { value },
      bubbles: true,
    }),
  );
}

function submitForm(name: string): void {
  fireEvent.submit(screen.getByRole('form', { name }));
}

describe('Ajustes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra el perfil actual, los formularios y el cierre de sesión', () => {
    renderAjustes();

    expect(screen.getByTestId('perfil-nombre')).toHaveValue('Erick');
    expect(screen.getByTestId('perfil-email')).toHaveValue('erick@example.com');
    expect(screen.getByRole('form', { name: 'Formulario de perfil' })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: 'Formulario de contraseña' })).toBeInTheDocument();
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('guarda el perfil con los datos normalizados', async () => {
    renderAjustes();

    setInput('perfil-nombre', '  Erick Ramírez  ');
    setInput('perfil-email', ' erick@example.com ');
    submitForm('Formulario de perfil');

    expect(await screen.findByText('Perfil actualizado correctamente.')).toBeInTheDocument();
    expect(updateProfile).toHaveBeenCalledWith({
      name: 'Erick Ramírez',
      email: 'erick@example.com',
    });
  });

  it('valida el perfil antes de enviar', async () => {
    renderAjustes();

    setInput('perfil-nombre', '');
    setInput('perfil-email', 'correo-invalido');
    submitForm('Formulario de perfil');

    expect(await screen.findByText('El nombre es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('Introduce un correo electrónico válido.')).toBeInTheDocument();
    expect(updateProfile).not.toHaveBeenCalled();
  });

  it('muestra los errores del API al guardar el perfil', async () => {
    updateProfile.mockRejectedValueOnce(
      new ApiError(422, 'VALIDACION_FALLIDA', 'Revisa los datos enviados.', {
        email: ['El correo ya está registrado.'],
      }),
    );

    renderAjustes();
    submitForm('Formulario de perfil');

    expect(await screen.findByText('El correo ya está registrado.')).toBeInTheDocument();
    expect(screen.getByText('Revisa los datos enviados.')).toBeInTheDocument();
  });

  it('valida la contraseña antes de enviar', async () => {
    renderAjustes();
    submitForm('Formulario de contraseña');

    expect(await screen.findByText('Escribe tu contraseña actual.')).toBeInTheDocument();
    expect(screen.getByText('La nueva contraseña es obligatoria.')).toBeInTheDocument();
    expect(screen.getByText('Confirma tu nueva contraseña.')).toBeInTheDocument();
    expect(changePassword).not.toHaveBeenCalled();
  });

  it('cambia la contraseña y limpia el formulario', async () => {
    renderAjustes();

    setInput('password-actual', 'actual123');
    setInput('password-nueva', 'nueva123');
    setInput('password-confirmacion', 'nueva123');
    submitForm('Formulario de contraseña');

    expect(await screen.findByText('Contraseña actualizada correctamente.')).toBeInTheDocument();
    expect(changePassword).toHaveBeenCalledWith({
      current_password: 'actual123',
      password: 'nueva123',
      password_confirmation: 'nueva123',
    });
  });

  it('muestra el error del API si la contraseña actual no coincide', async () => {
    changePassword.mockRejectedValueOnce(
      new ApiError(422, 'VALIDACION_FALLIDA', 'Revisa los datos enviados.', {
        current_password: ['La contraseña actual no es correcta.'],
      }),
    );

    renderAjustes();
    setInput('password-actual', 'incorrecta');
    setInput('password-nueva', 'nueva123');
    setInput('password-confirmacion', 'nueva123');
    submitForm('Formulario de contraseña');

    expect(await screen.findByText('La contraseña actual no es correcta.')).toBeInTheDocument();
    expect(screen.getByText('Revisa los datos enviados.')).toBeInTheDocument();
  });

  it('cierra la sesión desde el botón de la sección de sesión', () => {
    renderAjustes();

    fireEvent.click(screen.getByText('Cerrar sesión'));

    expect(logout).toHaveBeenCalledTimes(1);
  });
});
