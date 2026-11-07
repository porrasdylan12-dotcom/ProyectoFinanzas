import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { ApiError } from '../../lib/apiClient';
import {
  buildGroupPayload,
  createGroup,
  emptyGroupForm,
  getGroupErrorMessage,
  toGroupFieldErrors,
  validateGroupForm,
  type GroupFormErrors,
  type GroupFormValues,
} from '../../lib/groups';
import { GRUPO_ROUTES } from '../../navigation/routes';

import './grupos.css';

const GrupoForm: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<GroupFormValues>(emptyGroupForm);
  const [errors, setErrors] = useState<GroupFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateGroupForm(values);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const created = await createGroup(buildGroupPayload(values));
      navigate(GRUPO_ROUTES.detail(created.id), { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(toGroupFieldErrors(error));
      }
      setFormError(getGroupErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={GRUPO_ROUTES.list} />
          </IonButtons>
          <IonTitle>Nuevo grupo</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form
          className="grupo-form"
          onSubmit={handleSubmit}
          noValidate
          aria-busy={isSubmitting}
          aria-label="Formulario de grupo"
        >
          {formError && (
            <IonText color="danger">
              <p className="grupo-form__alert" role="alert">
                {formError}
              </p>
            </IonText>
          )}

          <IonText color="medium">
            <p className="grupo-form__hint">
              Quien crea el grupo queda como anfitrión y puede añadir integrantes por correo.
            </p>
          </IonText>

          <IonInput
            label="Nombre del grupo"
            labelPlacement="stacked"
            fill="outline"
            value={values.name}
            onIonInput={(event) => setValues({ name: String(event.detail.value ?? '') })}
            errorText={errors.name}
            className={errors.name ? 'ion-invalid ion-touched' : undefined}
            disabled={isSubmitting}
            data-testid="grupo-nombre"
          />

          <div className="grupo-form__actions">
            <IonButton type="submit" expand="block" disabled={isSubmitting}>
              {isSubmitting ? <IonSpinner name="crescent" /> : 'Crear grupo'}
            </IonButton>
            <IonButton fill="clear" expand="block" routerLink={GRUPO_ROUTES.list} disabled={isSubmitting}>
              Cancelar
            </IonButton>
          </div>
        </form>
      </IonContent>
    </IonPage>
  );
};

export default GrupoForm;
