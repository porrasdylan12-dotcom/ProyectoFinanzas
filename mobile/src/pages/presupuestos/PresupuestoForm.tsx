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
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { ApiError } from '../../lib/apiClient';
import {
  BUDGET_MONTHS,
  buildBudgetPayload,
  createBudget,
  emptyBudgetForm,
  getBudgetErrorMessage,
  toBudgetFieldErrors,
  validateBudgetForm,
  type BudgetFormErrors,
  type BudgetFormValues,
} from '../../lib/budgets';
import { fetchAllCategories, type Category } from '../../lib/categories';
import { PRESUPUESTO_ROUTES } from '../../navigation/routes';

import './presupuestos.css';

interface PresupuestoFormFieldsProps {
  categories: Category[];
  onSubmit: (values: BudgetFormValues) => Promise<void>;
}

const PresupuestoFormFields: React.FC<PresupuestoFormFieldsProps> = ({ categories, onSubmit }) => {
  const [values, setValues] = useState(emptyBudgetForm);
  const [errors, setErrors] = useState<BudgetFormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = <Field extends keyof BudgetFormValues>(field: Field, value: BudgetFormValues[Field]): void => {
    setValues((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors = validateBudgetForm(values);
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
        setErrors(toBudgetFieldErrors(error));
      }
      setFormError(getBudgetErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      className="presupuesto-form"
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isSubmitting}
      aria-label="Formulario de presupuesto"
    >
      {formError && (
        <IonText color="danger">
          <p className="presupuesto-form__alert" role="alert">
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
        data-testid="presupuesto-nombre"
      />

      <IonSelect
        label="Categoría"
        labelPlacement="stacked"
        fill="outline"
        value={values.categoryId}
        onIonChange={(event) => updateField('categoryId', String(event.detail.value ?? ''))}
        errorText={errors.categoryId}
        className={errors.categoryId ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting || categories.length === 0}
        data-testid="presupuesto-categoria"
      >
        {categories.map((category) => (
          <IonSelectOption key={category.id} value={String(category.id)}>
            {category.nombre}
          </IonSelectOption>
        ))}
      </IonSelect>

      {categories.length === 0 && (
        <IonText color="medium">
          <p className="presupuesto-form__hint">Crea una categoría antes de registrar un presupuesto.</p>
        </IonText>
      )}

      <IonInput
        label="Monto máximo"
        labelPlacement="stacked"
        fill="outline"
        type="number"
        inputMode="decimal"
        min="0.01"
        step="0.01"
        value={values.maxAmount}
        onIonInput={(event) => updateField('maxAmount', String(event.detail.value ?? ''))}
        errorText={errors.maxAmount}
        className={errors.maxAmount ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="presupuesto-monto"
      />

      <IonSelect
        label="Mes"
        labelPlacement="stacked"
        fill="outline"
        value={values.month}
        onIonChange={(event) => updateField('month', String(event.detail.value ?? ''))}
        errorText={errors.month}
        className={errors.month ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="presupuesto-mes"
      >
        {BUDGET_MONTHS.map((month) => (
          <IonSelectOption key={month.value} value={String(month.value)}>
            {month.label}
          </IonSelectOption>
        ))}
      </IonSelect>

      <IonInput
        label="Año"
        labelPlacement="stacked"
        fill="outline"
        type="number"
        inputMode="numeric"
        min="2020"
        max="2100"
        value={values.year}
        onIonInput={(event) => updateField('year', String(event.detail.value ?? ''))}
        errorText={errors.year}
        className={errors.year ? 'ion-invalid ion-touched' : undefined}
        disabled={isSubmitting}
        data-testid="presupuesto-anio"
      />

      <div className="presupuesto-form__actions">
        <IonButton type="submit" expand="block" disabled={isSubmitting}>
          {isSubmitting ? <IonSpinner name="crescent" /> : 'Crear presupuesto'}
        </IonButton>
        <IonButton fill="clear" expand="block" routerLink={PRESUPUESTO_ROUTES.list} disabled={isSubmitting}>
          Cancelar
        </IonButton>
      </div>
    </form>
  );
};

const PresupuestoForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: categories,
    status,
    error,
    reload,
  } = useAsyncData(fetchAllCategories, {
    cacheKey: 'categories:all',
  });

  const handleSubmit = async (values: BudgetFormValues): Promise<void> => {
    await createBudget(buildBudgetPayload(values));
    navigate(PRESUPUESTO_ROUTES.list, { replace: true });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={PRESUPUESTO_ROUTES.list} />
          </IonButtons>
          <IonTitle>Nuevo presupuesto</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <DataState
          status={status}
          error={error}
          hasData={categories !== null}
          onRetry={() => void reload()}
          loadingMessage="Cargando categorías…"
        >
          {categories && <PresupuestoFormFields categories={categories} onSubmit={handleSubmit} />}
        </DataState>
      </IonContent>
    </IonPage>
  );
};

export default PresupuestoForm;
