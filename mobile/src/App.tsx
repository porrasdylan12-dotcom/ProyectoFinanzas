import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { lazy, Suspense, type ReactNode } from 'react';
import { Route } from 'react-router-dom';

import { AuthProvider } from './auth/AuthProvider';
import { GuestOnly, RequireAuth, RootRedirect } from './auth/guards';
import SessionLoading from './components/SessionLoading';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Panel = lazy(() => import('./pages/panel/Panel'));

setupIonicReact();

const withSuspense = (page: ReactNode): ReactNode => <Suspense fallback={<SessionLoading />}>{page}</Suspense>;

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <AuthProvider>
        <IonRouterOutlet>
          <Route path="/login" element={<GuestOnly>{withSuspense(<Login />)}</GuestOnly>} />
          <Route path="/register" element={<GuestOnly>{withSuspense(<Register />)}</GuestOnly>} />
          <Route path="/forgot-password" element={<GuestOnly>{withSuspense(<ForgotPassword />)}</GuestOnly>} />
          <Route path="/panel" element={<RequireAuth>{withSuspense(<Panel />)}</RequireAuth>} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<RootRedirect />} />
        </IonRouterOutlet>
      </AuthProvider>
    </IonReactRouter>
  </IonApp>
);

export default App;
