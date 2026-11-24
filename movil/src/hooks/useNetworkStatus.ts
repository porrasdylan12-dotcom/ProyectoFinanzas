import { Network } from '@capacitor/network';
import { useEffect, useState } from 'react';

function getInitialStatus(): boolean {
  return typeof navigator === 'undefined' ? true : navigator.onLine;
}

export function useNetworkStatus(): boolean {
  const [isOnline, setIsOnline] = useState(getInitialStatus);

  useEffect(() => {
    let active = true;
    let removeListener: (() => void) | undefined;

    void Network.getStatus()
      .then((status) => {
        if (active) {
          setIsOnline(status.connected);
        }
      })
      .catch(() => undefined);

    void Network.addListener('networkStatusChange', (status) => {
      if (active) {
        setIsOnline(status.connected);
      }
    })
      .then((handle) => {
        if (active) {
          removeListener = () => {
            void handle.remove();
          };
        } else {
          void handle.remove();
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
      removeListener?.();
    };
  }, []);

  return isOnline;
}
