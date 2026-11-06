import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

import { useAuth } from '../../auth/AuthContext';

const Panel: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Panel</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Hola, {user?.nombre ?? 'usuario'}.</p>
        <p>El panel principal se implementa en un segmento posterior.</p>
        <IonButton expand="block" color="danger" onClick={() => void logout()}>
          Cerrar sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Panel;
