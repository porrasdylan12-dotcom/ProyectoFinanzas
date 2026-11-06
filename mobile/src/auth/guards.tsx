import type { PropsWithChildren } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import SessionLoading from '../components/SessionLoading';

import { useAuth } from './AuthContext';

interface LocationState {
  from?: string;
}

export const RequireAuth: React.FC<PropsWithChildren> = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <SessionLoading />;
  }

  if (status === 'guest') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export const GuestOnly: React.FC<PropsWithChildren> = ({ children }) => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <SessionLoading />;
  }

  if (status === 'authenticated') {
    const from = (location.state as LocationState | null)?.from;
    const destination = from?.startsWith('/') ? from : '/panel';

    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};

export const RootRedirect: React.FC = () => {
  const { status } = useAuth();

  if (status === 'loading') {
    return <SessionLoading />;
  }

  return <Navigate to={status === 'authenticated' ? '/panel' : '/login'} replace />;
};
