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
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useCallback } from 'react';
import { useParams } from 'react-router-dom';

import DataState from '../../components/DataState';
import { useAsyncData } from '../../hooks/useAsyncData';
import { accountTypeLabel, fetchAccount } from '../../lib/accounts';
import { formatMoney } from '../../lib/money';
import { CUENTA_ROUTES } from '../../navigation/routes';

import './cuentas.css';

const CuentaDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const accountId = Number(id);

  const fetchCurrentAccount = useCallback(async () => {
    if (!Number.isInteger(accountId) || accountId <= 0) {
      throw new Error('La cuenta solicitada no es válida.');
    }

    return fetchAccount(accountId);
  }, [accountId]);

  const { data: account, status, error, reload } = useAsyncData(fetchCurrentAccount);

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
            </div>
          )}
        </DataState>
      </IonContent>
    </IonPage>
  );
};

export default CuentaDetalle;
