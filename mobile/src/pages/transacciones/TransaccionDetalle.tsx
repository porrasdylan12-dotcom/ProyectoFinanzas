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
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { fetchAccount, type Account } from '../../lib/accounts';
import { fetchAllCategories, type Category } from '../../lib/categories';
import { formatMoney } from '../../lib/money';
import {
  fetchTransaction,
  formatTransactionDate,
  transactionTypeLabel,
  type Transaction,
} from '../../lib/transactions';
import { CUENTA_ROUTES, TRANSACCION_ROUTES } from '../../navigation/routes';

import './transacciones.css';

interface TransaccionDetalleData {
  transaction: Transaction;
  category: Category | undefined;
  account: Account;
}

const TransaccionDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const transactionId = Number(id);

  const loadTransaction = useCallback(async (): Promise<TransaccionDetalleData> => {
    if (!Number.isInteger(transactionId) || transactionId <= 0) {
      throw new Error('La transacción solicitada no es válida.');
    }

    const transaction = await fetchTransaction(transactionId);
    const [categories, account] = await Promise.all([fetchAllCategories(), fetchAccount(transaction.cuenta_id)]);

    return {
      transaction,
      category: categories.find((item) => item.id === transaction.categoria_id),
      account,
    };
  }, [transactionId]);

  const { data, status, error, reload } = useAsyncData(loadTransaction);
  const isIncome = data?.transaction.tipo === 'ingreso';

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={data ? CUENTA_ROUTES.detail(data.account.id) : CUENTA_ROUTES.list} />
          </IonButtons>
          <IonTitle>Transacción</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <DataState
          status={status}
          error={error}
          hasData={data !== null}
          onRetry={() => void reload()}
          loadingMessage="Cargando transacción…"
        >
          {data && (
            <div className="transaccion-detalle">
              <IonCard className="transaccion-detalle__card">
                <IonCardHeader>
                  <IonCardSubtitle>{transactionTypeLabel(data.transaction.tipo)}</IonCardSubtitle>
                  <IonCardTitle>{data.transaction.descripcion || 'Sin descripción'}</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p className="transaccion-detalle__label">Monto</p>
                  <p
                    className={`transaccion-detalle__amount ${
                      isIncome ? 'transaccion-detalle__amount--income' : 'transaccion-detalle__amount--expense'
                    }`}
                    data-testid="transaccion-monto"
                  >
                    {isIncome ? '+' : '-'}
                    {formatMoney(data.transaction.monto)}
                  </p>
                  <IonBadge color={isIncome ? 'success' : 'danger'}>
                    {transactionTypeLabel(data.transaction.tipo)}
                  </IonBadge>
                </IonCardContent>
              </IonCard>

              <IonList inset>
                <IonItem>
                  <IonLabel>
                    <h2>Fecha</h2>
                    <p>{formatTransactionDate(data.transaction.fecha)}</p>
                  </IonLabel>
                </IonItem>
                <IonItem>
                  <IonLabel>
                    <h2>Categoría</h2>
                    <p>{data.category?.nombre ?? `Categoría #${data.transaction.categoria_id}`}</p>
                  </IonLabel>
                </IonItem>
                <IonItem
                  button
                  detail
                  routerLink={CUENTA_ROUTES.detail(data.account.id)}
                  data-testid="transaccion-cuenta"
                >
                  <IonLabel>
                    <h2>Cuenta</h2>
                    <p>{data.account.nombre}</p>
                  </IonLabel>
                  <IonNote slot="end">{formatMoney(data.account.saldo)}</IonNote>
                </IonItem>
              </IonList>

              <div className="transaccion-detalle__actions">
                <IonButton expand="block" fill="outline" routerLink={TRANSACCION_ROUTES.newForAccount(data.account.id)}>
                  Registrar otra
                </IonButton>
                <IonButton expand="block" fill="clear" routerLink={CUENTA_ROUTES.detail(data.account.id)}>
                  Volver a la cuenta
                </IonButton>
              </div>
            </div>
          )}
        </DataState>
      </IonContent>
    </IonPage>
  );
};

export default TransaccionDetalle;
