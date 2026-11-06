import { IonContent, IonPage, IonSpinner } from '@ionic/react';
import type React from 'react';

const SessionLoading: React.FC = () => (
  <IonPage>
    <IonContent className="ion-padding ion-text-center">
      <div style={{ marginTop: '40vh' }}>
        <IonSpinner name="crescent" />
        <p>Cargando sesión…</p>
      </div>
    </IonContent>
  </IonPage>
);

export default SessionLoading;
