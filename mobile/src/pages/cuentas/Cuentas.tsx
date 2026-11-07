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

import DataState from '../../components/DataState';
import { useInfiniteList } from '../../hooks/useInfiniteList';
import { accountTypeLabel, fetchAccountsPage } from '../../lib/accounts';
import { formatMoney } from '../../lib/money';
import { CUENTA_ROUTES } from '../../navigation/routes';

import './cuentas.css';

const Cuentas: React.FC = () => {
  const list = useInfiniteList(fetchAccountsPage);

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>): void => {
    void list.refresh().finally(() => event.detail.complete());
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
