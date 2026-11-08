import { IonIcon } from '@ionic/react';
import { cloudOfflineOutline } from 'ionicons/icons';

import { useNetworkStatus } from '../hooks/useNetworkStatus';

import './offlineBanner.css';

const OfflineBanner: React.FC = () => {
  const isOnline = useNetworkStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="offline-banner" role="status" aria-live="polite">
      <IonIcon icon={cloudOfflineOutline} aria-hidden="true" />
      <span>Sin conexión. Mostrando los datos guardados.</span>
    </div>
  );
};

export default OfflineBanner;
