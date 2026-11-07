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
import { fetchGroupsPage } from '../../lib/groups';
import { GRUPO_ROUTES } from '../../navigation/routes';

import './grupos.css';

const Grupos: React.FC = () => {
  const list = useInfiniteList(fetchGroupsPage);

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
          <IonTitle>Grupos</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink={GRUPO_ROUTES.new} aria-label="Crear grupo">
              <IonIcon slot="start" icon={addOutline} aria-hidden="true" />
              Nuevo
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <section className="grupos" aria-labelledby="grupos-title">
          <div className="grupos__intro">
            <h1 id="grupos-title">Tus grupos</h1>
            <p>Organiza gastos compartidos y consulta las deudas entre integrantes.</p>
          </div>

          <DataState
            status={list.status}
            error={list.error}
            hasData={list.items.length > 0}
            isEmpty={list.isEmpty}
            onRetry={() => void list.refresh()}
            loadingMessage="Cargando grupos…"
            emptyMessage="Aún no tienes grupos."
          >
            <div>
              {list.error && (
                <IonText color="danger">
                  <p className="grupos__alert" role="alert">
                    No se pudo actualizar la lista de grupos.
                  </p>
                </IonText>
              )}

              <IonList inset className="grupos__list">
                {list.items.map((group) => {
                  const members = group.miembros?.length ?? 0;

                  return (
                    <IonItem
                      key={group.id}
                      button
                      detail
                      routerLink={GRUPO_ROUTES.detail(group.id)}
                      data-testid={`grupo-${group.id}`}
                    >
                      <IonLabel>
                        <h2>{group.nombre}</h2>
                        <p>
                          {members} {members === 1 ? 'integrante' : 'integrantes'}
                        </p>
                      </IonLabel>
                      <IonNote slot="end" aria-hidden="true">
                        {members}
                      </IonNote>
                    </IonItem>
                  );
                })}
              </IonList>
            </div>
          </DataState>

          {list.isEmpty && (
            <div className="grupos__empty-action">
              <IonButton routerLink={GRUPO_ROUTES.new}>Crear tu primer grupo</IonButton>
            </div>
          )}

          <IonInfiniteScroll onIonInfinite={handleInfinite} disabled={!list.hasMore || list.isLoadingMore}>
            <IonInfiniteScrollContent loadingText="Cargando más grupos…" />
          </IonInfiniteScroll>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Grupos;
