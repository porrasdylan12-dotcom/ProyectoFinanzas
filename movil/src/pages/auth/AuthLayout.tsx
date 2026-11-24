import { IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { walletOutline } from 'ionicons/icons';
import type { PropsWithChildren } from 'react';

import './auth.css';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<PropsWithChildren<AuthLayoutProps>> = ({ title, subtitle, children }) => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Proyecto Finanzas</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding auth-content">
      <div className="auth-container">
        <div className="auth-brand">
          <IonIcon icon={walletOutline} color="primary" className="auth-logo" aria-hidden="true" />
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        {children}
      </div>
    </IonContent>
  </IonPage>
);

export default AuthLayout;
