import { IonButton, IonSpinner, IonText } from '@ionic/react';
import type { ReactNode } from 'react';

import type { LoadStatus } from '../lib/asyncState';

export interface DataStateProps {
  status: LoadStatus;
  isEmpty?: boolean;
  hasData?: boolean;
  error?: unknown;
  onRetry?: () => void;
  loadingMessage?: string;
  emptyMessage?: string;
  errorMessage?: string;
  children: ReactNode;
}

function resolveErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

const DataState: React.FC<DataStateProps> = ({
  status,
  isEmpty = false,
  hasData = false,
  error,
  onRetry,
  loadingMessage = 'Cargando…',
  emptyMessage = 'No hay información para mostrar.',
  errorMessage = 'No se pudo cargar la información.',
  children,
}) => {
  if (status === 'loading' && !hasData) {
    return (
      <div className="ion-padding ion-text-center" role="status" aria-live="polite">
        <IonSpinner name="crescent" aria-label={loadingMessage} />
        <IonText color="medium">
          <p>{loadingMessage}</p>
        </IonText>
      </div>
    );
  }

  if (status === 'error' && !hasData) {
    return (
      <div className="ion-padding ion-text-center" role="alert">
        <IonText color="danger">
          <p>{resolveErrorMessage(error, errorMessage)}</p>
        </IonText>
        {onRetry && (
          <IonButton fill="outline" onClick={onRetry}>
            Reintentar
          </IonButton>
        )}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="ion-padding ion-text-center">
        <IonText color="medium">
          <p>{emptyMessage}</p>
        </IonText>
      </div>
    );
  }

  return <>{children}</>;
};

export default DataState;
