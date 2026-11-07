import { IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { homeOutline, peopleOutline, settingsOutline, walletOutline } from 'ionicons/icons';
import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, useLocation } from 'react-router-dom';

import SessionLoading from '../components/SessionLoading';

import {
  CUENTA_PATHS,
  GASTO_COMPARTIDO_PATHS,
  GRUPO_PATHS,
  PRESUPUESTO_PATHS,
  TAB_ROUTES,
  TRANSACCION_PATHS,
  isTabRoot,
} from './routes';
import { useAndroidBackButton } from './useAndroidBackButton';

const Panel = lazy(() => import('../pages/panel/Panel'));
const Cuentas = lazy(() => import('../pages/cuentas/Cuentas'));
const CuentaDetalle = lazy(() => import('../pages/cuentas/CuentaDetalle'));
const CuentaForm = lazy(() => import('../pages/cuentas/CuentaForm'));
const TransaccionDetalle = lazy(() => import('../pages/transacciones/TransaccionDetalle'));
const TransaccionForm = lazy(() => import('../pages/transacciones/TransaccionForm'));
const PresupuestoForm = lazy(() => import('../pages/presupuestos/PresupuestoForm'));
const Grupos = lazy(() => import('../pages/grupos/Grupos'));
const GrupoForm = lazy(() => import('../pages/grupos/GrupoForm'));
const GrupoDetalle = lazy(() => import('../pages/grupos/GrupoDetalle'));
const GastoForm = lazy(() => import('../pages/grupos/GastoForm'));
const GastoDetalle = lazy(() => import('../pages/grupos/GastoDetalle'));
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

  useAndroidBackButton();

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path={TAB_ROUTES.panel} element={withSuspense(<Panel />)} />
        <Route path={TAB_ROUTES.cuentas} element={withSuspense(<Cuentas />)} />
        <Route path={CUENTA_PATHS.new} element={withSuspense(<CuentaForm />)} />
        <Route path={CUENTA_PATHS.edit} element={withSuspense(<CuentaForm />)} />
        <Route path={TRANSACCION_PATHS.newForAccount} element={withSuspense(<TransaccionForm />)} />
        <Route path={TRANSACCION_PATHS.detail} element={withSuspense(<TransaccionDetalle />)} />
        <Route path={PRESUPUESTO_PATHS.new} element={withSuspense(<PresupuestoForm />)} />
        <Route path={CUENTA_PATHS.detail} element={withSuspense(<CuentaDetalle />)} />
        <Route path={TAB_ROUTES.grupos} element={withSuspense(<Grupos />)} />
        <Route path={GRUPO_PATHS.new} element={withSuspense(<GrupoForm />)} />
        <Route path={GRUPO_PATHS.newExpense} element={withSuspense(<GastoForm />)} />
        <Route path={GRUPO_PATHS.detail} element={withSuspense(<GrupoDetalle />)} />
        <Route path={GASTO_COMPARTIDO_PATHS.detail} element={withSuspense(<GastoDetalle />)} />
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
