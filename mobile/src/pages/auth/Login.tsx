import { IonButton, IonInput, IonSpinner, IonText } from '@ionic/react';
import { useState, type FormEvent } from 'react';

import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../lib/apiClient';

import AuthLayout from './AuthLayout';
import { buildLoginCredentials, getErrorMessage, toFieldErrors, validateLoginForm, type FormErrors } from './authForm';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateLoginForm({ email, password });
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(buildLoginCredentials({ email, password }));
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(toFieldErrors(error));
      }
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Administra tus cuentas y gastos compartidos.">
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
        aria-label="Formulario de inicio de sesión"
      >
        {formError && (
          <IonText color="danger">
            <p className="auth-alert" role="alert">
              {formError}
            </p>
          </IonText>
        )}

        <IonInput
          label="Correo electrónico"
          labelPlacement="stacked"
          fill="outline"
          type="email"
          inputMode="email"
          autocomplete="email"
          value={email}
          onIonInput={(event) => setEmail(event.detail.value ?? '')}
          errorText={errors.email}
          className={errors.email ? 'ion-invalid ion-touched' : undefined}
          disabled={isSubmitting}
          data-testid="login-email"
        />

        <IonInput
          label="Contraseña"
          labelPlacement="stacked"
          fill="outline"
          type="password"
          autocomplete="current-password"
          value={password}
          onIonInput={(event) => setPassword(event.detail.value ?? '')}
          errorText={errors.password}
          className={errors.password ? 'ion-invalid ion-touched' : undefined}
          disabled={isSubmitting}
          data-testid="login-password"
        />

        <IonButton
          type="submit"
          expand="block"
          className="auth-submit"
          disabled={isSubmitting}
          aria-label={isSubmitting ? 'Iniciando sesión' : 'Entrar'}
        >
          {isSubmitting ? <IonSpinner name="crescent" /> : 'Entrar'}
        </IonButton>
      </form>

      <div className="auth-links">
        <IonButton fill="clear" size="small" routerLink="/forgot-password" disabled={isSubmitting}>
          ¿Olvidaste tu contraseña?
        </IonButton>
        <IonButton fill="clear" size="small" routerLink="/register" disabled={isSubmitting}>
          Crear cuenta
        </IonButton>
      </div>
    </AuthLayout>
  );
};

export default Login;
