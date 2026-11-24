import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import {
  ACCOUNT_TYPES,
  accountToFormValues,
  accountTypeLabel,
  buildAccountPayload,
  createAccount,
  emptyAccountForm,
  fetchAccount,
  getAccountErrorMessage,
  isAccountType,
  toAccountFieldErrors,
  updateAccount,
  validateAccountForm,
  type AccountFormErrors,
  type AccountFormValues,
} from '../../lib/accounts';
import { ApiError } from '../../lib/apiClient';
import { CUENTA_ROUTES } from '../../navigation/routes';

import './cuentas.css';

interface AccountFormFieldsProps {
  initialValues: AccountFormValues;
  submitLabel: string;
  cancelHref: string;
  onSubmit: (values: AccountFormValues) => Promise<void>;
}

const AccountFormFields: React.FC<AccountFormFieldsProps> = ({ initialValues, submitLabel, cancelHref, onSubmit }) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<AccountFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <Field extends keyof AccountFormValues>(field: Field, value: AccountFormValues[Field]): void => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateAccountForm(values);
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
        setErrors(toAccountFieldErrors(error));
      }
      setFormError(getAccountErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="cuenta-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      aria-label="Formulario de cuenta"
    >
      {formError && (
        <IonText color="danger">
          <p className="cuenta-form__alert" role="alert">
            {formError}
          </p>
        </IonText>
      )}

      <IonInput
        label="Nombre"
        labelPlacement="stacked"
        fill="outline"
        value={values.name}
        onIonInput={(event) => updateField('name', String(event.detail.value ?? ''))}
        errorText={errors.name}
        className={errors.name ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="cuenta-nombre"
      />

      <IonSelect
        label="Tipo"
        labelPlacement="stacked"
        fill="outline"
        value={values.type}
        onIonChange={(event) => {
          const nextType = String(event.detail.value ?? '');

          if (isAccountType(nextType)) {
            updateField('type', nextType);
          }
        }}
        errorText={errors.type}
        className={errors.type ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="cuenta-tipo"
      >
        {ACCOUNT_TYPES.map((type) => (
          <IonSelectOption key={type} value={type}>
            {accountTypeLabel(type)}
          </IonSelectOption>
        ))}
      </IonSelect>

      <IonInput
        label="Saldo"
        labelPlacement="stacked"
        fill="outline"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={values.balance}
        onIonInput={(event) => updateField('balance', String(event.detail.value ?? ''))}
        errorText={errors.balance}
        className={errors.balance ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="cuenta-saldo"
      />

      <div className="cuenta-form__actions">
        <IonButton type="submit" expand="block" disabled={isSubmitting}>
          {isSubmitting ? <IonSpinner name="crescent" /> : submitLabel}
        </IonButton>
        <IonButton fill="clear" expand="block" routerLink={cancelHref} disabled={isSubmitting}>
          Cancelar
        </IonButton>
      </div>
    </form>
  );
};

const CuentaFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const accountId = id ? Number(id) : null;

  const fetchCurrentAccount = useCallback(async () => {
    if (accountId === null) {
      return null;
    }

    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new Error('La cuenta solicitada no es válida.');
    }

    return fetchAccount(accountId);
  }, [accountId]);

  const {
    data: account,
    status,
    error,
    reload,
  } = useAsyncData(fetchCurrentAccount, {
    cacheKey: accountId ? `account:${accountId}` : undefined,
  });

  const handleSubmit = async (values: AccountFormValues): Promise<void> => {
    const payload = buildAccountPayload(values);

    if (isEditing && accountId !== null) {
      const updated = await updateAccount(accountId, payload);
      navigate(CUENTA_ROUTES.detail(updated.id), { replace: true });
      return;
    }

    const created = await createAccount(payload);
    navigate(CUENTA_ROUTES.detail(created.id), { replace: true });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={isEditing && accountId ? CUENTA_ROUTES.detail(accountId) : CUENTA_ROUTES.list}
            />
          </IonButtons>
          <IonTitle>{isEditing ? 'Editar cuenta' : 'Nueva cuenta'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {isEditing ? (
          <DataState
            status={status}
            error={error}
            hasData={account !== null}
            onRetry={() => void reload()}
            loadingMessage="Cargando cuenta…"
          >
            {account && (
              <AccountFormFields
                key={account.id}
                initialValues={accountToFormValues(account)}
                submitLabel="Guardar cambios"
                cancelHref={CUENTA_ROUTES.detail(account.id)}
                onSubmit={handleSubmit}
              />
            )}
          </DataState>
        ) : (
          <AccountFormFields
            initialValues={emptyAccountForm()}
            submitLabel="Crear cuenta"
            cancelHref={CUENTA_ROUTES.list}
            onSubmit={handleSubmit}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default CuentaFormPage;
