import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import DataState from './DataState';

describe('DataState', () => {
  it('muestra el estado de carga', () => {
    render(
      <DataState status="loading" loadingMessage="Cargando cuentas…">
        <p>Contenido</p>
      </DataState>,
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Cargando cuentas…')).toBeInTheDocument();
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('muestra el error y permite reintentar', () => {
    const onRetry = vi.fn();

    render(
      <DataState status="error" error={new Error('Sin conexión')} onRetry={onRetry}>
        <p>Contenido</p>
      </DataState>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Sin conexión');
    fireEvent.click(screen.getByText('Reintentar'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('muestra el estado vacío', () => {
    render(
      <DataState status="success" isEmpty emptyMessage="Aún no hay cuentas.">
        <p>Contenido</p>
      </DataState>,
    );

    expect(screen.getByText('Aún no hay cuentas.')).toBeInTheDocument();
    expect(screen.queryByText('Contenido')).not.toBeInTheDocument();
  });

  it('muestra el contenido cuando hay datos', () => {
    render(
      <DataState status="success" hasData>
        <p>Contenido</p>
      </DataState>,
    );

    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('mantiene el contenido durante una recarga', () => {
    render(
      <DataState status="loading" hasData>
        <p>Contenido</p>
      </DataState>,
    );

    expect(screen.getByText('Contenido')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
