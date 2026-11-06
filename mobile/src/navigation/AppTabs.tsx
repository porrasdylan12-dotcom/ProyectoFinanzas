import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { homeOutline, peopleOutline, settingsOutline, walletOutline } from 'ionicons/icons';
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';

import SessionLoading from '../components/SessionLoading';

import { TAB_ROUTES, isTabRoot } from './routes';

const Panel = lazy(() => import('../pages/panel/Panel'));
const Cuentas = lazy(() => import('../pages/cuentas/Cuentas'));
const Grupos = lazy(() => import('../pages/grupos/Grupos'));
const Ajustes = lazy(() => import('../pages/ajustes/Ajustes'));

const TABS = [
  { tab: 'panel', href: TAB_ROUTES.panel, label: 'Panel', icon: homeOutline },
  { tab: 'cuentas', href: TAB_ROUTES.cuentas, label: 'Cuentas', icon: walletOutline },
  { tab: 'grupos', href: TAB_ROUTES.grupos, label: 'Grupos', icon: peopleOutline },
  { tab: 'ajustes', href: TAB_ROUTES.ajustes, label: 'Ajustes', icon: settingsOutline },
] as const;

const withSuspense = (page: ReactNode): ReactNode => <Suspense fallback={<SessionLoading />}>{page}</Suspense>;

const AppTabs: React.FC = () => {
  const location = useLocation();
  const showTabBar = isTabRoot(location.pathname);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path={TAB_ROUTES.panel} element={withSuspense(<Panel />)} />
        <Route path={TAB_ROUTES.cuentas} element={withSuspense(<Cuentas />)} />
        <Route path={TAB_ROUTES.grupos} element={withSuspense(<Grupos />)} />
        <Route path={TAB_ROUTES.ajustes} element={withSuspense(<Ajustes />)} />
        <Route path="*" element={<Navigate to={TAB_ROUTES.panel} replace />} />
      </IonRouterOutlet>

      {showTabBar && (
        <IonTabBar slot="bottom">
          {TABS.map(({ tab, href, label, icon }) => (
            <IonTabButton key={tab} tab={tab} href={href} data-testid={`tab-${tab}`}>
              <IonIcon aria-hidden="true" icon={icon} />
              <IonLabel>{label}</IonLabel>
            </IonTabButton>
          ))}
        </IonTabBar>
      )}
    </IonTabs>
  );
};

export default AppTabs;
