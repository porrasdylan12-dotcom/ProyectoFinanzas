import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Grupos: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Grupos</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>El listado de grupos se implementará en el segmento 10.</p>
    </IonContent>
  </IonPage>
);

export default Grupos;
