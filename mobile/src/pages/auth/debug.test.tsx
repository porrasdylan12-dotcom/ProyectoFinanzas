import { IonInput } from '@ionic/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

describe('debug ion input', () => {
  it('calls onIonInput', () => {
    const handler = vi.fn();
    render(<IonInput data-testid="plain" onIonInput={handler} />);

    const input = screen.getByTestId('plain');
    fireEvent(input, new CustomEvent('ionInput', { detail: { value: 'hola' } }));

    // eslint-disable-next-line no-console
    console.log('called', handler.mock.calls.length);
    expect(handler).toHaveBeenCalled();
  });

  it('calls onIonChange', () => {
    const handler = vi.fn();
    render(<IonInput data-testid="plain2" onIonChange={handler} />);

    const input = screen.getByTestId('plain2');
    fireEvent(input, new CustomEvent('ionChange', { detail: { value: 'hola' } }));

    // eslint-disable-next-line no-console
    console.log('called change', handler.mock.calls.length);
    expect(handler).toHaveBeenCalled();
  });
});
