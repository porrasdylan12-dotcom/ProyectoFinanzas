import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonTitle,
  IonToolbar,
  type InfiniteScrollCustomEvent,
  type RefresherEventDetail,
} from '@ionic/react';
import { addOutline } from 'ionicons/icons';
import { useCallback } from 'react';

import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import { accountTypeLabel, fetchAccountsPage } from '../../lib/accounts';
import { fetchBudgetsPage, monthLabel } from '../../lib/budgets';
import { formatMoney } from '../../lib/money';
import { CUENTA_ROUTES, PRESUPUESTO_ROUTES } from '../../navigation/routes';

import './cuentas.css';

const Cuentas: React.FC = () => {
  const list = useInfiniteList(fetchAccountsPage);
  const loadBudgets = useCallback(() => fetchBudgetsPage(1, 50), []);
  const budgets = useAsyncData(loadBudgets);
  const budgetItems = budgets.data?.data ?? [];

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>): void => {
    void Promise.all([list.refresh(), budgets.reload()]).finally(() => event.detail.complete());
  };

  const handleInfinite = async (event: InfiniteScrollCustomEvent): Promise<void> => {
    await list.loadMore();
    await event.target.complete();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Cuentas</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={CUENTA_ROUTES.new} aria-label="Crear cuenta">
              <IonIcon slot="start" icon={addOutline} aria-hidden="true" />
              Nueva
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <section className="cuentas__section" aria-labelledby="presupuestos-title">
          <div className="cuentas__section-header">
            <h2 id="presupuestos-title">Presupuestos</h2>
            <IonButton size="small" fill="outline" routerLink={PRESUPUESTO_ROUTES.new} aria-label="Crear presupuesto">
              <IonIcon slot="start" icon={addOutline} aria-hidden="true" />
              Nuevo
            </IonButton>
          </div>

          <DataState
            status={budgets.status}
            error={budgets.error}
            hasData={budgetItems.length > 0}
            isEmpty={budgets.status === 'success' && budgetItems.length === 0}
            onRetry={() => void budgets.reload()}
            loadingMessage="Cargando presupuestos…"
            emptyMessage="Aún no tienes presupuestos."
          >
            <IonList inset className="cuentas__list">
              {budgetItems.map((budget) => (
                <IonItem key={budget.id} data-testid={`presupuesto-${budget.id}`}>
                  <IonLabel>
                    <h3>{budget.nombre}</h3>
                    <p>
                      {monthLabel(budget.mes)} {budget.año}
                    </p>
                  </IonLabel>
                  <IonNote slot="end" className="cuentas__balance">
                    {formatMoney(budget.monto_maximo)}
                  </IonNote>
                </IonItem>
              ))}
            </IonList>
          </DataState>
        </section>

        <section className="cuentas__section" aria-labelledby="cuentas-title">
          <div className="cuentas__section-header">
            <h2 id="cuentas-title">Cuentas</h2>
          </div>

          <DataState
            status={list.status}
            error={list.error}
            hasData={list.items.length > 0}
            isEmpty={list.isEmpty}
            onRetry={() => void list.refresh()}
            loadingMessage="Cargando cuentas…"
            emptyMessage="Aún no tienes cuentas."
          >
            <div className="cuentas">
              {list.error && (
                <IonText color="danger">
                  <p className="cuentas__alert" role="alert">
                    No se pudo actualizar la lista de cuentas.
                  </p>
                </IonText>
              )}

              <IonList inset className="cuentas__list">
                {list.items.map((account) => (
                  <IonItem
                    key={account.id}
                    routerLink={CUENTA_ROUTES.detail(account.id)}
                    button
                    detail
                    data-testid={`cuenta-${account.id}`}
                  >
                    <IonLabel>
                      <h2>{account.nombre}</h2>
                      <p>{accountTypeLabel(account.tipo)}</p>
                    </IonLabel>
                    <IonNote slot="end" className="cuentas__balance">
                      {formatMoney(account.saldo)}
                    </IonNote>
                  </IonItem>
                ))}
              </IonList>
            </div>
          </DataState>
        </section>

        {list.isEmpty && (
          <div className="cuentas__empty-action">
            <IonButton routerLink={CUENTA_ROUTES.new}>Crear tu primera cuenta</IonButton>
          </div>
        )}

        <IonInfiniteScroll onIonInfinite={handleInfinite} disabled={!list.hasMore || list.isLoadingMore}>
          <IonInfiniteScrollContent loadingText="Cargando más cuentas…" />
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default Cuentas;
