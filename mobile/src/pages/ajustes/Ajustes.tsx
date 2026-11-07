import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { logOutOutline } from 'ionicons/icons';
import { useState, type FormEvent } from 'react';

import { useAuth, type AuthUser, type PasswordPayload, type ProfilePayload } from '../../auth/AuthContext';
import { ApiError } from '../../lib/apiClient';
import {
  buildPasswordPayload,
  buildProfilePayload,
  emptyPasswordForm,
  getProfileErrorMessage,
  profileFormFromUser,
  toPasswordFieldErrors,
  toProfileFieldErrors,
  validatePasswordForm,
  validateProfileForm,
  type PasswordFormValues,
  type ProfileFormErrors,
  type ProfileFormValues,
} from '../../lib/profile';

import './ajustes.css';

interface ProfileSectionProps {
  user: AuthUser;
  onSubmit: (payload: ProfilePayload) => Promise<void>;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ user, onSubmit }) => {
  const [values, setValues] = useState<ProfileFormValues>(() => profileFormFromUser(user));
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof ProfileFormValues, value: string): void => {
    setValues((current) => ({ ...current, [field]: value }));
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateProfileForm(values);
    setErrors(nextErrors);
    setFormError(null);
    setSuccess(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildProfilePayload(values);
      await onSubmit(payload);
      setValues({ name: payload.name, email: payload.email });
      setSuccess('Perfil actualizado correctamente.');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(toProfileFieldErrors(error));
      }
      setFormError(getProfileErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonCard className="ajustes__card">
      <IonCardHeader>
        <IonCardTitle>Perfil</IonCardTitle>
        <IonCardSubtitle>Actualiza tu nombre y correo electrónico.</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <form
          className="ajustes-form"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
          aria-label="Formulario de perfil"
        >
          {formError && (
            <IonText color="danger">
              <p className="ajustes__alert" role="alert">
                {formError}
              </p>
            </IonText>
          )}

          {success && (
            <IonText color="success">
              <p className="ajustes__alert" role="status">
                {success}
              </p>
            </IonText>
          )}

          <IonInput
            label="Nombre"
            labelPlacement="stacked"
            fill="outline"
            type="text"
            autocomplete="name"
            value={values.name}
            onIonInput={(event) => updateField('name', String(event.detail.value ?? ''))}
            errorText={errors.name}
            className={errors.name ? 'ion-invalid ion-touched' : undefined}
            disabled={isSubmitting}
            data-testid="perfil-nombre"
          />

          <IonInput
            label="Correo electrónico"
            labelPlacement="stacked"
            fill="outline"
            type="email"
            inputMode="email"
            autocomplete="email"
            value={values.email}
            onIonInput={(event) => updateField('email', String(event.detail.value ?? ''))}
            errorText={errors.email}
            className={errors.email ? 'ion-invalid ion-touched' : undefined}
            disabled={isSubmitting}
            data-testid="perfil-email"
          />

          <IonButton type="submit" expand="block" disabled={isSubmitting}>
            {isSubmitting ? <IonSpinner name="crescent" /> : 'Guardar cambios'}
          </IonButton>
        </form>
      </IonCardContent>
    </IonCard>
  );
};

interface PasswordSectionProps {
  onSubmit: (payload: PasswordPayload) => Promise<void>;
}

const PasswordSection: React.FC<PasswordSectionProps> = ({ onSubmit }) => {
  const [values, setValues] = useState<PasswordFormValues>(emptyPasswordForm);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof PasswordFormValues, value: string): void => {
    setValues((current) => ({ ...current, [field]: value }));
    setSuccess(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validatePasswordForm(values);
    setErrors(nextErrors);
    setFormError(null);
    setSuccess(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(buildPasswordPayload(values));
      setValues(emptyPasswordForm());
      setSuccess('Contraseña actualizada correctamente.');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(toPasswordFieldErrors(error));
      }
      setFormError(getProfileErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonCard className="ajustes__card">
      <IonCardHeader>
        <IonCardTitle>Contraseña</IonCardTitle>
        <IonCardSubtitle>Cambia tu contraseña de acceso.</IonCardSubtitle>
      </IonCardHeader>
      <IonCardContent>
        <form
          className="ajustes-form"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
          aria-label="Formulario de contraseña"
        >
          {formError && (
            <IonText color="danger">
              <p className="ajustes__alert" role="alert">
                {formError}
              </p>
            </IonText>
          )}

          {success && (
            <IonText color="success">
              <p className="ajustes__alert" role="status">
                {success}
              </p>
            </IonText>
          )}

          <IonInput
            label="Contraseña actual"
            labelPlacement="stacked"
            fill="outline"
            type="password"
            autocomplete="current-password"
            value={values.currentPassword}
            onIonInput={(event) => updateField('currentPassword', String(event.detail.value ?? ''))}
            errorText={errors.currentPassword}
            className={errors.currentPassword ? 'ion-invalid ion-touched' : undefined}
            disabled={isSubmitting}
            data-testid="password-actual"
          />

          <IonInput
            label="Nueva contraseña"
            labelPlacement="stacked"
            fill="outline"
            type="password"
            autocomplete="new-password"
            value={values.password}
            onIonInput={(event) => updateField('password', String(event.detail.value ?? ''))}
            errorText={errors.password}
            className={errors.password ? 'ion-invalid ion-touched' : undefined}
            disabled={isSubmitting}
            data-testid="password-nueva"
          />

          <IonInput
            label="Confirmar nueva contraseña"
            labelPlacement="stacked"
            fill="outline"
            type="password"
            autocomplete="new-password"
            value={values.passwordConfirmation}
            onIonInput={(event) => updateField('passwordConfirmation', String(event.detail.value ?? ''))}
            errorText={errors.passwordConfirmation}
            className={errors.passwordConfirmation ? 'ion-invalid ion-touched' : undefined}
            disabled={isSubmitting}
            data-testid="password-confirmacion"
          />

          <IonButton type="submit" expand="block" disabled={isSubmitting}>
            {isSubmitting ? <IonSpinner name="crescent" /> : 'Cambiar contraseña'}
          </IonButton>
        </form>
      </IonCardContent>
    </IonCard>
  );
};

const Ajustes: React.FC = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Ajustes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <section className="ajustes" aria-labelledby="ajustes-title">
          <header className="ajustes__intro">
            <h1 id="ajustes-title">Tu cuenta</h1>
            <p>Administra tus datos de acceso y tu sesión.</p>
          </header>

          {user ? (
            <>
              <ProfileSection user={user} onSubmit={updateProfile} />
              <PasswordSection onSubmit={changePassword} />

              <IonCard className="ajustes__card">
                <IonCardHeader>
                  <IonCardTitle>Sesión</IonCardTitle>
                  <IonCardSubtitle>Cierra la sesión en este dispositivo.</IonCardSubtitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonButton expand="block" fill="outline" color="danger" onClick={() => void logout()}>
                    <IonIcon slot="start" icon={logOutOutline} aria-hidden="true" />
                    Cerrar sesión
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </>
          ) : (
            <IonText color="medium">
              <p>No hay una sesión activa.</p>
            </IonText>
          )}
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Ajustes;
