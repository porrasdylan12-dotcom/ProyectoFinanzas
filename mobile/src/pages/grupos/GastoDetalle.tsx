import {
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';

import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { debtStatusLabel, isPendingDebt, settleGroupDebt, type GroupDebt } from '../../lib/groupDebts';
import { fetchGroup, getGroupErrorMessage, groupMemberName, type Group } from '../../lib/groups';
import { formatMoney } from '../../lib/money';
import { fetchSharedExpense, formatSharedExpenseDate, type SharedExpense } from '../../lib/sharedExpenses';
import { GRUPO_ROUTES } from '../../navigation/routes';

import './grupos.css';

interface GastoDetalleContentProps {
  expense: SharedExpense;
  group: Group;
  reload: () => Promise<void>;
}

const GastoDetalleContent: React.FC<GastoDetalleContentProps> = ({ expense, group, reload }) => {
  const [settlingDebtId, setSettlingDebtId] = useState<number | null>(null);
  const [settleError, setSettleError] = useState<string | null>(null);
  const debts = expense.deudas ?? [];
  const participants = expense.participantes ?? [];

  const handleSettle = async (debt: GroupDebt): Promise<void> => {
    if (settlingDebtId !== null) {
      return;
    }

    setSettlingDebtId(debt.id);
    setSettleError(null);

    try {
      await settleGroupDebt(debt);
      await reload();
    } catch (error) {
      setSettleError(getGroupErrorMessage(error));
    } finally {
      setSettlingDebtId(null);
    }
  };

  return (
    <>
      <IonCard className="gasto-detalle__card">
        <IonCardHeader>
          <IonCardSubtitle>{formatSharedExpenseDate(expense.fecha)}</IonCardSubtitle>
          <IonCardTitle>{expense.descripcion || 'Gasto compartido'}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p className="gasto-detalle__label">Monto total</p>
          <p className="gasto-detalle__total" data-testid="gasto-total">
            {formatMoney(expense.monto)}
          </p>
          <div className="gasto-detalle__meta">
            <p>Pagó: {groupMemberName(group, expense.usuario_id)}</p>
            <p>
              Participantes: {participants.map((participantId) => groupMemberName(group, participantId)).join(', ')}
            </p>
          </div>
        </IonCardContent>
      </IonCard>

      <section className="gasto-detalle__section" aria-labelledby="deudas-title">
        <div className="gasto-detalle__section-header">
          <h2 id="deudas-title">Deudas</h2>
        </div>

        {settleError && (
          <IonText color="danger">
            <p className="gasto-detalle__alert" role="alert">
              {settleError}
            </p>
          </IonText>
        )}

        {debts.length === 0 ? (
          <IonText color="medium">
            <p>Este gasto no generó deudas.</p>
          </IonText>
        ) : (
          <IonList inset className="gasto-detalle__list">
            {debts.map((debt) => {
              const debtorName = groupMemberName(group, debt.deudor_id);
              const creditorName = groupMemberName(group, debt.acreedor_id);
              const pending = isPendingDebt(debt);
              const isSettling = settlingDebtId === debt.id;

              return (
                <IonItem key={debt.id} data-testid={`deuda-${debt.id}`}>
                  <IonLabel>
                    <h3>
                      {debtorName} debe a {creditorName}
                    </h3>
                    <p>
                      <IonBadge color={pending ? 'warning' : 'success'}>{debtStatusLabel(debt.estado)}</IonBadge>
                    </p>
                  </IonLabel>
                  <IonNote slot="end" className={pending ? 'gasto-detalle__amount' : 'gasto-detalle__paid'}>
                    {formatMoney(debt.monto_total)}
                  </IonNote>
                  {pending && (
                    <IonButton
                      slot="end"
                      size="small"
                      fill="outline"
                      disabled={settlingDebtId !== null}
                      onClick={() => void handleSettle(debt)}
                      aria-label={`Saldar deuda de ${debtorName}`}
                      data-testid={`saldar-deuda-${debt.id}`}
                    >
                      {isSettling ? <IonSpinner name="crescent" /> : 'Saldar'}
                    </IonButton>
                  )}
                </IonItem>
              );
            })}
          </IonList>
        )}
      </section>
    </>
  );
};

const GastoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const expenseId = Number(id);

  const loadExpense = useCallback(async () => {
    if (!Number.isInteger(expenseId) || expenseId <= 0) {
      throw new Error('El gasto compartido solicitado no es válido.');
    }

    const expense = await fetchSharedExpense(expenseId);
    const group = await fetchGroup(expense.grupo_id);

    return { expense, group };
  }, [expenseId]);

  const { data, status, error, reload } = useAsyncData(loadExpense);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={data ? GRUPO_ROUTES.detail(data.group.id) : GRUPO_ROUTES.list} />
          </IonButtons>
          <IonTitle>Gasto compartido</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <DataState
          status={status}
          error={error}
          hasData={data !== null}
          onRetry={() => void reload()}
          loadingMessage="Cargando gasto compartido…"
        >
          {data && (
            <div className="gasto-detalle">
              <GastoDetalleContent expense={data.expense} group={data.group} reload={reload} />
            </div>
          )}
        </DataState>
      </IonContent>
    </IonPage>
  );
};

export default GastoDetalle;
