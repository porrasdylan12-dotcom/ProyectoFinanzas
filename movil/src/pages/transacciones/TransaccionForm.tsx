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
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useCallback, useMemo, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAccount, type Account } from '../../lib/accounts';
import { ApiError } from '../../lib/apiClient';
import { fetchAllCategories, type Category } from '../../lib/categories';
import {
  TRANSACTION_TYPES,
  buildTransactionPayload,
  createTransaction,
  emptyTransactionForm,
  getTransactionErrorMessage,
  toTransactionFieldErrors,
  transactionTypeLabel,
  validateTransactionForm,
  type TransactionFormErrors,
  type TransactionFormValues,
  type TransactionType,
} from '../../lib/transactions';
import { CUENTA_ROUTES, TRANSACCION_ROUTES } from '../../navigation/routes';

import './transacciones.css';

interface TransaccionFormFieldsProps {
  account: Account;
  categories: Category[];
  onSubmit: (values: TransactionFormValues) => Promise<void>;
}

const TransaccionFormFields: React.FC<TransaccionFormFieldsProps> = ({ account, categories, onSubmit }) => {
  const [values, setValues] = useState(() => emptyTransactionForm(account.id));
  const [errors, setErrors] = useState<TransactionFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.tipo === values.type),
    [categories, values.type],
  );

  const updateField = <Field extends keyof TransactionFormValues>(
    field: Field,
    value: TransactionFormValues[Field],
  ): void => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleTypeChange = (type: TransactionType): void => {
    setValues((current) => ({ ...current, type, categoryId: '' }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateTransactionForm(values);
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
        setErrors(toTransactionFieldErrors(error));
      }
      setFormError(getTransactionErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="transaccion-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      aria-label="Formulario de transacción"
    >
      {formError && (
        <IonText color="danger">
          <p className="transaccion-form__alert" role="alert">
            {formError}
          </p>
        </IonText>
      )}

      <IonText color="medium">
        <p className="transaccion-form__hint">Cuenta: {account.nombre}</p>
      </IonText>

      <IonSelect
        label="Tipo"
        labelPlacement="stacked"
        fill="outline"
        value={values.type}
        onIonChange={(event) => {
          const nextType = String(event.detail.value ?? '');

          if (nextType === 'ingreso' || nextType === 'gasto') {
            handleTypeChange(nextType);
          }
        }}
        errorText={errors.type}
        className={errors.type ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="transaccion-tipo"
      >
        {TRANSACTION_TYPES.map((type) => (
          <IonSelectOption key={type} value={type}>
            {transactionTypeLabel(type)}
          </IonSelectOption>
        ))}
      </IonSelect>

      <IonSelect
        label="Categoría"
        labelPlacement="stacked"
        fill="outline"
        value={values.categoryId}
        onIonChange={(event) => updateField('categoryId', String(event.detail.value ?? ''))}
        errorText={errors.categoryId}
        className={errors.categoryId ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting || filteredCategories.length === 0}
        data-testid="transaccion-categoria"
      >
        {filteredCategories.map((category) => (
          <IonSelectOption key={category.id} value={String(category.id)}>
            {category.nombre}
          </IonSelectOption>
        ))}
      </IonSelect>

      {filteredCategories.length === 0 && (
        <IonText color="medium">
          <p className="transaccion-form__hint">No hay categorías de este tipo. Crea una categoría primero.</p>
        </IonText>
      )}

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
        data-testid="transaccion-monto"
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
        data-testid="transaccion-fecha"
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
        data-testid="transaccion-descripcion"
      />

      <div className="transaccion-form__actions">
        <IonButton type="submit" expand="block" disabled={isSubmitting}>
          {isSubmitting ? <IonSpinner name="crescent" /> : 'Registrar transacción'}
        </IonButton>
        <IonButton fill="clear" expand="block" routerLink={CUENTA_ROUTES.detail(account.id)} disabled={isSubmitting}>
          Cancelar
        </IonButton>
      </div>
    </form>
  );
};

const TransaccionForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const accountId = Number(id);

  const loadFormData = useCallback(async () => {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new Error('La cuenta solicitada no es válida.');
    }

    const [account, categories] = await Promise.all([fetchAccount(accountId), fetchAllCategories()]);

    return { account, categories };
  }, [accountId]);

  const { data, status, error, reload } = useAsyncData(loadFormData, {
    cacheKey: `transaction-form:${accountId}`,
  });

  const handleSubmit = async (values: TransactionFormValues): Promise<void> => {
    const created = await createTransaction(buildTransactionPayload(values));
    navigate(TRANSACCION_ROUTES.detail(created.id), { replace: true });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={Number.isInteger(accountId) ? CUENTA_ROUTES.detail(accountId) : CUENTA_ROUTES.list}
            />
          </IonButtons>
          <IonTitle>Nueva transacción</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <DataState
          status={status}
          error={error}
          hasData={data !== null}
          onRetry={() => void reload()}
          loadingMessage="Cargando formulario…"
        >
          {data && (
            <TransaccionFormFields account={data.account} categories={data.categories} onSubmit={handleSubmit} />
          )}
        </DataState>
      </IonContent>
    </IonPage>
  );
};

export default TransaccionForm;
