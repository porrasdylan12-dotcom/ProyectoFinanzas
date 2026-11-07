import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
  IonPage,
  IonSpinner,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useAuth } from '../../auth/AuthContext';
import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { ApiError } from '../../lib/apiClient';
import { fetchGroup, type Group, type GroupMember } from '../../lib/groups';
import {
  buildSharedExpensePayload,
  createSharedExpense,
  emptySharedExpenseForm,
  getSharedExpenseErrorMessage,
  toSharedExpenseFieldErrors,
  validateSharedExpenseForm,
  type SharedExpenseFormErrors,
  type SharedExpenseFormValues,
} from '../../lib/sharedExpenses';
import { GASTO_COMPARTIDO_ROUTES, GRUPO_ROUTES } from '../../navigation/routes';

import './grupos.css';

interface GastoFormFieldsProps {
  group: Group;
  payerName: string;
  onSubmit: (values: SharedExpenseFormValues) => Promise<void>;
}

const GastoFormFields: React.FC<GastoFormFieldsProps> = ({ group, payerName, onSubmit }) => {
  const members = group.miembros ?? [];
  const [values, setValues] = useState<SharedExpenseFormValues>(() =>
    emptySharedExpenseForm(members.map((member) => member.id)),
  );
  const [errors, setErrors] = useState<SharedExpenseFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <Field extends keyof SharedExpenseFormValues>(
    field: Field,
    value: SharedExpenseFormValues[Field],
  ): void => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const toggleParticipant = (member: GroupMember): void => {
    setValues((current) => {
      const selected = current.participantIds.includes(member.id)
        ? current.participantIds.filter((id) => id !== member.id)
        : [...current.participantIds, member.id];

      return { ...current, participantIds: selected };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateSharedExpenseForm(values);
    setErrors(nextErrors);
    setFormError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(toSharedExpenseFieldErrors(error));
      }
      setFormError(getSharedExpenseErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="gasto-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      aria-label="Formulario de gasto compartido"
    >
      {formError && (
        <IonText color="danger">
          <p className="gasto-form__alert" role="alert">
            {formError}
          </p>
        </IonText>
      )}

      <IonText color="medium">
        <p className="gasto-form__hint">
          Grupo: {group.nombre} · Paga: {payerName}
        </p>
      </IonText>

      <IonInput
        label="Monto"
        labelPlacement="stacked"
        fill="outline"
        type="number"
        inputMode="decimal"
        min="0.01"
        step="0.01"
        value={values.amount}
        onIonInput={(event) => updateField('amount', String(event.detail.value ?? ''))}
        errorText={errors.amount}
        className={errors.amount ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="gasto-monto"
      />

      <IonInput
        label="Fecha"
        labelPlacement="stacked"
        fill="outline"
        type="date"
        value={values.date}
        onIonInput={(event) => updateField('date', String(event.detail.value ?? ''))}
        errorText={errors.date}
        className={errors.date ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="gasto-fecha"
      />

      <IonTextarea
        label="Descripción (opcional)"
        labelPlacement="stacked"
        fill="outline"
        autoGrow
        value={values.description}
        onIonInput={(event) => updateField('description', String(event.detail.value ?? ''))}
        errorText={errors.description}
        className={errors.description ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="gasto-descripcion"
      />

      <section className="gasto-form__participants" aria-labelledby="participantes-title">
        <h2 id="participantes-title">Participantes</h2>
        <IonText color="medium">
          <p>El monto se reparte en partes iguales entre las personas seleccionadas.</p>
        </IonText>

        <IonList lines="none">
          {members.map((member) => (
            <IonItem key={member.id} className="gasto-form__participant">
              <IonCheckbox
                checked={values.participantIds.includes(member.id)}
                onIonChange={() => toggleParticipant(member)}
                disabled={isSubmitting}
                data-testid={`participante-${member.id}`}
              >
                <span className="gasto-form__participant-label">
                  <span>{member.nombre}</span>
                  <IonText color="medium">
                    <small>{member.email}</small>
                  </IonText>
                </span>
              </IonCheckbox>
            </IonItem>
          ))}
        </IonList>

        {errors.participantIds && (
          <IonText color="danger">
            <p role="alert">{errors.participantIds}</p>
          </IonText>
        )}
      </section>

      <div className="gasto-form__actions">
        <IonButton type="submit" expand="block" disabled={isSubmitting}>
          {isSubmitting ? <IonSpinner name="crescent" /> : 'Registrar gasto'}
        </IonButton>
        <IonButton fill="clear" expand="block" routerLink={GRUPO_ROUTES.detail(group.id)} disabled={isSubmitting}>
          Cancelar
        </IonButton>
      </div>
    </form>
  );
};

const GastoForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const groupId = Number(id);

  const loadGroup = useCallback(async () => {
    if (!Number.isInteger(groupId) || groupId <= 0) {
      throw new Error('El grupo solicitado no es válido.');
    }

    return fetchGroup(groupId);
  }, [groupId]);

  const { data: group, status, error, reload } = useAsyncData(loadGroup);

  const handleSubmit = async (values: SharedExpenseFormValues): Promise<void> => {
    const created = await createSharedExpense(groupId, buildSharedExpensePayload(values));
    navigate(GASTO_COMPARTIDO_ROUTES.detail(created.id), { replace: true });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={Number.isInteger(groupId) ? GRUPO_ROUTES.detail(groupId) : GRUPO_ROUTES.list} />
          </IonButtons>
          <IonTitle>Nuevo gasto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <DataState
          status={status}
          error={error}
          hasData={group !== null}
          onRetry={() => void reload()}
          loadingMessage="Cargando grupo…"
        >
          {group && <GastoFormFields group={group} payerName={user?.nombre ?? 'tu cuenta'} onSubmit={handleSubmit} />}
        </DataState>
      </IonContent>
    </IonPage>
  );
};

export default GastoForm;
