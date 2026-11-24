import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonText,
  IonTitle,
  IonToolbar,
  type RefresherEventDetail,
} from '@ionic/react';
import { chevronForwardOutline, logOutOutline } from 'ionicons/icons';
import { useCallback, type PropsWithChildren } from 'react';

import { useAuth } from '../../auth/AuthContext';
import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { formatMoney, loadPanelSummary } from '../../lib/panelSummary';

import './panel.css';

interface SummaryRowProps {
  label: string;
  value: string;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value }) => (
  <div className="panel__row">
    <span className="panel__label">{label}</span>
    <strong className="panel__value">{value}</strong>
  </div>
);

interface SummaryCardProps extends PropsWithChildren {
  title: string;
  intro: string;
  link: string;
  linkLabel: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, intro, link, linkLabel, children }) => (
  <IonCard className="panel__card">
    <IonCardHeader>
      <IonCardTitle>{title}</IonCardTitle>
      <IonCardSubtitle>{intro}</IonCardSubtitle>
    </IonCardHeader>
    <IonCardContent>
      <div className="panel__rows">{children}</div>
      <IonButton fill="clear" size="small" routerLink={link} className="panel__link">
        {linkLabel}
        <IonIcon slot="end" icon={chevronForwardOutline} aria-hidden="true" />
      </IonButton>
    </IonCardContent>
  </IonCard>
);

const Panel: React.FC = () => {
  const { user, logout } = useAuth();

  const fetchSummary = useCallback(async () => {
    if (!user) {
      throw new Error('No hay una sesión activa.');
    }

    return loadPanelSummary(user.id);
  }, [user]);

  const {
    data: summary,
    status,
    error,
    reload,
  } = useAsyncData(fetchSummary, {
    cacheKey: user ? `panel:${user.id}` : undefined,
  });

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>): void => {
    void reload().finally(() => event.detail.complete());
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Panel</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <DataState
          status={status}
          error={error}
          hasData={summary !== null}
          onRetry={() => void reload()}
          loadingMessage="Cargando tu resumen…"
        >
          <section className="panel">
            <header className="panel__welcome">
              <h1>Hola, {user?.nombre ?? 'usuario'}.</h1>
              <p>Este es el resumen de tus finanzas.</p>
            </header>

            {error && summary && (
              <IonText color="danger">
                <p className="panel__alert" role="alert">
                  No se pudo actualizar el resumen.
                </p>
              </IonText>
            )}

            {summary && (
              <div className="panel__grid">
                <SummaryCard
                  title="Cuentas"
                  intro="Tus cuentas, saldos y presupuestos."
                  link="/cuentas"
                  linkLabel="Ir a Cuentas"
                >
                  <SummaryRow label="Cuentas" value={String(summary.accountsCount)} />
                  <SummaryRow label="Saldo total" value={formatMoney(summary.totalBalance)} />
                  <SummaryRow label="Presupuestos cerca del límite" value={String(summary.budgetsNearLimit)} />
                </SummaryCard>

                <SummaryCard
                  title="Grupos"
                  intro="Tus gastos compartidos y deudas."
                  link="/grupos"
                  linkLabel="Ir a Grupos"
                >
                  <SummaryRow label="Debes" value={formatMoney(summary.owedByUser)} />
                  <SummaryRow label="Te deben" value={formatMoney(summary.owedToUser)} />
                </SummaryCard>

                <SummaryCard
                  title="Usuario"
                  intro="Tu información y tus ajustes."
                  link="/ajustes"
                  linkLabel="Ir a Ajustes"
                >
                  <SummaryRow label="Nombre" value={user?.nombre ?? '—'} />
                  <SummaryRow label="Correo" value={user?.email ?? '—'} />
                  <IonButton
                    expand="block"
                    fill="outline"
                    color="danger"
                    className="panel__logout"
                    onClick={() => void logout()}
                  >
                    <IonIcon slot="start" icon={logOutOutline} aria-hidden="true" />
                    Cerrar sesión
                  </IonButton>
                </SummaryCard>
              </div>
            )}
          </section>
        </DataState>
      </IonContent>
    </IonPage>
  );
};

export default Panel;
