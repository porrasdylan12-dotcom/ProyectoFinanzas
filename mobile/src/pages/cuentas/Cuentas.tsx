import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Cuentas: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Cuentas</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>El listado de cuentas se implementará en el segmento 8.</p>
    </IonContent>
  </IonPage>
);

export default Cuentas;
