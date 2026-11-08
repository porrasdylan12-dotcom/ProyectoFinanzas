import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useNetworkStatus } from '../hooks/useNetworkStatus';

import OfflineBanner from './OfflineBanner';

vi.mock('../hooks/useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(),
}));

const networkStatus = vi.mocked(useNetworkStatus);

describe('OfflineBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('no muestra nada cuando hay conexión', () => {
    networkStatus.mockReturnValue(true);

    render(<OfflineBanner />);

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('avisa cuando no hay conexión', () => {
    networkStatus.mockReturnValue(false);

    render(<OfflineBanner />);

    expect(screen.getByRole('status')).toHaveTextContent('Sin conexión. Mostrando los datos guardados.');
  });
});
