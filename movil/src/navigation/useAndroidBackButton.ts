import { App } from '@capacitor/app';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { TAB_ROUTES, isTabRoot } from './routes';

export type BackAction = 'exit' | 'panel' | 'back';

export function resolveBackAction(pathname: string, canGoBack: boolean): BackAction {
  if (pathname === TAB_ROUTES.panel) {
    return 'exit';
  }

  if (isTabRoot(pathname) || !canGoBack) {
    return 'panel';
  }

  return 'back';
}

export function useAndroidBackButton(): void {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (Capacitor.getPlatform() !== 'android') {
      return;
    }

    let listener: PluginListenerHandle | undefined;
    let disposed = false;

    const register = async (): Promise<void> => {
      listener = await App.addListener('backButton', ({ canGoBack }) => {
        const action = resolveBackAction(pathnameRef.current, canGoBack);

        if (action === 'exit') {
          void App.exitApp();
          return;
        }

        if (action === 'panel') {
          navigate(TAB_ROUTES.panel, { replace: true });
          return;
        }

        navigate(-1);
      });

      if (disposed) {
        await listener.remove();
      }
    };

    void register();

    return () => {
      disposed = true;
      void listener?.remove();
    };
  }, [navigate]);
}
