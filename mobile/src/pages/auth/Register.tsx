import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Register: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Crear cuenta</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>El formulario de registro se implementa en el siguiente segmento.</p>
    </IonContent>
  </IonPage>
);

export default Register;
