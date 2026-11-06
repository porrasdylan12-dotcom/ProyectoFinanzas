import { IonButton, IonInput, IonSpinner, IonText } from '@ionic/react';
import { useState, type FormEvent } from 'react';

import { useAuth } from '../../auth/AuthContext';
import { ApiError } from '../../lib/apiClient';

import AuthLayout from './AuthLayout';
import { getErrorMessage, toFieldErrors, validateRegisterForm, type FormErrors } from './authForm';

const Register: React.FC = () => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateRegisterForm({
      name,
      email,
      password,
      passwordConfirmation,
    });
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      });
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
    <AuthLayout title="Crear cuenta" subtitle="Registra tus datos para empezar a organizar tus finanzas.">
      <form
        className="auth-form"
        onSubmit={handleSubmit}
        noValidate
        aria-busy={isSubmitting}
        aria-label="Formulario de registro"
      >
        {formError && (
          <IonText color="danger">
            <p className="auth-alert" role="alert">
              {formError}
            </p>
          </IonText>
        )}

        <IonInput
          label="Nombre"
          labelPlacement="stacked"
          fill="outline"
          type="text"
          autocomplete="name"
          value={name}
          onIonInput={(event) => setName(event.detail.value ?? '')}
          errorText={errors.name}
          className={errors.name ? 'ion-invalid ion-touched' : undefined}
          disabled={isSubmitting}
          data-testid="register-name"
        />

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
          data-testid="register-email"
        />

        <IonInput
          label="Contraseña"
          labelPlacement="stacked"
          fill="outline"
          type="password"
          autocomplete="new-password"
          value={password}
          onIonInput={(event) => setPassword(event.detail.value ?? '')}
          errorText={errors.password}
          className={errors.password ? 'ion-invalid ion-touched' : undefined}
          disabled={isSubmitting}
          data-testid="register-password"
        />

        <IonInput
          label="Confirmar contraseña"
          labelPlacement="stacked"
          fill="outline"
          type="password"
          autocomplete="new-password"
          value={passwordConfirmation}
          onIonInput={(event) => setPasswordConfirmation(event.detail.value ?? '')}
          errorText={errors.password_confirmation}
          className={errors.password_confirmation ? 'ion-invalid ion-touched' : undefined}
          disabled={isSubmitting}
          data-testid="register-password-confirmation"
        />

        <IonButton
          type="submit"
          expand="block"
          className="auth-submit"
          disabled={isSubmitting}
          aria-label={isSubmitting ? 'Creando cuenta' : 'Crear cuenta'}
        >
          {isSubmitting ? <IonSpinner name="crescent" /> : 'Crear cuenta'}
        </IonButton>
      </form>

      <div className="auth-links">
        <IonButton fill="clear" size="small" routerLink="/login" disabled={isSubmitting}>
          Ya tengo una cuenta
        </IonButton>
      </div>
    </AuthLayout>
  );
};

export default Register;
