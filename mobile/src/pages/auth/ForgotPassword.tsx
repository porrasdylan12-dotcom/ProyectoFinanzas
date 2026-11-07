import { IonButton, IonInput, IonSpinner, IonText } from '@ionic/react';
import { useState, type FormEvent } from 'react';

import { apiClient } from '../../lib/apiClient';

import AuthLayout from './AuthLayout';
import { getErrorMessage, validateForgotPasswordForm, type FormErrors } from './authForm';

interface ForgotPasswordResponse {
  message: string;
}

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateForgotPasswordForm(email);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.post<ForgotPasswordResponse>(
        '/forgot-password',
        { email: email.trim() },
        { auth: false },
      );

      setSuccessMessage(response.message);
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Recuperar contraseña" subtitle="Te enviaremos un enlace para restablecer tu contraseña.">
      {successMessage ? (
        <div className="auth-success">
          <IonText color="success">
            <p role="status">{successMessage}</p>
          </IonText>
          <IonButton expand="block" routerLink="/login">
            Volver a iniciar sesión
          </IonButton>
        </div>
      ) : (
        <>
          <form
            className="auth-form"
            onSubmit={handleSubmit}
            noValidate
            aria-busy={isSubmitting}
            aria-label="Formulario de recuperación de contraseña"
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
              data-testid="forgot-email"
            />

            <IonButton
              type="submit"
              expand="block"
              className="auth-submit"
              disabled={isSubmitting}
              aria-label={isSubmitting ? 'Enviando enlace' : 'Enviar enlace'}
            >
              {isSubmitting ? <IonSpinner name="crescent" /> : 'Enviar enlace'}
            </IonButton>
          </form>

          <div className="auth-links">
            <IonButton fill="clear" size="small" routerLink="/login" disabled={isSubmitting}>
              Volver a iniciar sesión
            </IonButton>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
