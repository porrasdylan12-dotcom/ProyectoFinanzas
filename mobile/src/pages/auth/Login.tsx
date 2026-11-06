import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

const Login: React.FC = () => (
  <IonPage>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Iniciar sesión</IonTitle>
      </IonToolbar>
    </IonHeader>
    <IonContent className="ion-padding">
      <p>El formulario de inicio de sesión se implementa en el siguiente segmento.</p>
    </IonContent>
  </IonPage>
);

export default Login;
