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
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
  type InfiniteScrollCustomEvent,
} from '@ionic/react';
import { useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import { accountTypeLabel, fetchAccount, type Account } from '../../lib/accounts';
import { fetchAllCategories } from '../../lib/categories';
import { formatMoney } from '../../lib/money';
import { formatTransactionDate, fetchTransactionsPage, transactionTypeLabel } from '../../lib/transactions';
import { CUENTA_ROUTES, TRANSACCION_ROUTES } from '../../navigation/routes';

import './cuentas.css';

interface CuentaDetalleContentProps {
  account: Account;
}

const CuentaDetalleContent: React.FC<CuentaDetalleContentProps> = ({ account }) => {
  const loadTransactions = useCallback(
    (page: number, perPage: number) => fetchTransactionsPage(account.id, page, perPage),
    [account.id],
  );
  const transactions = useInfiniteList(loadTransactions, { cacheKey: `transactions:${account.id}` });
  const { data: categories } = useAsyncData(fetchAllCategories, { cacheKey: 'categories:all' });
  const categoryNames = useMemo(
    () => new Map((categories ?? []).map((category) => [category.id, category.nombre])),
    [categories],
  );

  const handleInfinite = async (event: InfiniteScrollCustomEvent): Promise<void> => {
    await transactions.loadMore();
    await event.target.complete();
  };

  return (
    <>
      <IonCard className="cuenta-detalle__card">
        <IonCardHeader>
          <IonCardSubtitle>{accountTypeLabel(account.tipo)}</IonCardSubtitle>
          <IonCardTitle>{account.nombre}</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p className="cuenta-detalle__label">Saldo actual</p>
          <p className="cuenta-detalle__balance" data-testid="cuenta-saldo">
            {formatMoney(account.saldo)}
          </p>
          <IonBadge color="medium">{accountTypeLabel(account.tipo)}</IonBadge>
        </IonCardContent>
      </IonCard>

      <section className="cuenta-detalle__transactions" aria-labelledby="transacciones-title">
        <div className="cuenta-detalle__section-header">
          <h2 id="transacciones-title">Transacciones</h2>
          <IonButton size="small" fill="outline" routerLink={TRANSACCION_ROUTES.newForAccount(account.id)}>
            Registrar
          </IonButton>
        </div>

        <DataState
          status={transactions.status}
          error={transactions.error}
          hasData={transactions.items.length > 0}
          isEmpty={transactions.isEmpty}
          onRetry={() => void transactions.refresh()}
          loadingMessage="Cargando transacciones…"
          emptyMessage="Aún no hay transacciones en esta cuenta."
        >
          {transactions.error && (
            <IonText color="danger">
              <p className="cuenta-detalle__alert" role="alert">
                No se pudo actualizar la lista de transacciones.
              </p>
            </IonText>
          )}

          <IonList inset className="cuenta-detalle__list">
            {transactions.items.map((transaction) => (
              <IonItem
                key={transaction.id}
                button
                detail
                routerLink={TRANSACCION_ROUTES.detail(transaction.id)}
                data-testid={`transaccion-${transaction.id}`}
              >
                <IonLabel>
                  <h3>{transaction.descripcion || transactionTypeLabel(transaction.tipo)}</h3>
                  <p>
                    {categoryNames.get(transaction.categoria_id) ?? `Categoría #${transaction.categoria_id}`} ·{' '}
                    {formatTransactionDate(transaction.fecha)}
                  </p>
                </IonLabel>
                <IonNote
                  slot="end"
                  color={transaction.tipo === 'ingreso' ? 'success' : 'danger'}
                  className="cuenta-detalle__amount"
                >
                  {transaction.tipo === 'ingreso' ? '+' : '-'}
                  {formatMoney(transaction.monto)}
                </IonNote>
              </IonItem>
            ))}
          </IonList>
        </DataState>

        {transactions.isEmpty && (
          <div className="cuenta-detalle__empty-action">
            <IonButton routerLink={TRANSACCION_ROUTES.newForAccount(account.id)}>Registrar transacción</IonButton>
          </div>
        )}

        <IonInfiniteScroll
          onIonInfinite={handleInfinite}
          disabled={!transactions.hasMore || transactions.isLoadingMore}
        >
          <IonInfiniteScrollContent loadingText="Cargando más transacciones…" />
        </IonInfiniteScroll>
      </section>
    </>
  );
};

const CuentaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const accountId = Number(id);

  const fetchCurrentAccount = useCallback(async () => {
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
    cacheKey: `account:${accountId}`,
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={CUENTA_ROUTES.list} />
          </IonButtons>
          <IonTitle>Cuenta</IonTitle>
          {account && (
            <IonButtons slot="end">
              <IonButton routerLink={CUENTA_ROUTES.edit(account.id)}>Editar</IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <DataState
          status={status}
          error={error}
          hasData={account !== null}
          onRetry={() => void reload()}
          loadingMessage="Cargando cuenta…"
        >
          {account && (
            <div className="cuenta-detalle">
              <CuentaDetalleContent account={account} />
            </div>
          )}
        </DataState>
      </IonContent>
    </IonPage>
  );
};

export default CuentaDetalle;
