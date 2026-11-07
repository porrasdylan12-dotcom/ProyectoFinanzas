import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Ajustes: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Ajustes</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>Los ajustes de usuario se implementarán en el segmento 11.</p>
    </IonContent>
  </IonPage>
);

export default Ajustes;
