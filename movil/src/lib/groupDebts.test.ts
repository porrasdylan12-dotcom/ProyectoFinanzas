import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from './apiClient';
import {
  buildSettleGroupDebtPayload,
  debtStatusLabel,
  isPendingDebt,
  settleGroupDebt,
  type GroupDebt,
} from './groupDebts';

vi.mock('./apiClient', () => ({
  apiClient: {
    patch: vi.fn(),
  },
}));

const patchRequest = vi.mocked(apiClient.patch);

const debt: GroupDebt = {
  id: 11,
  gasto_compartido_id: 9,
  deudor_id: 2,
  acreedor_id: 1,
  monto_total: '500.00',
  estado: 'pending',
};

describe('groupDebts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('describe el estado y construye el payload para saldar', () => {
    expect(debtStatusLabel('pending')).toBe('Pendiente');
    expect(debtStatusLabel('paid')).toBe('Pagada');
    expect(debtStatusLabel('other')).toBe('other');
    expect(isPendingDebt(debt)).toBe(true);
    expect(isPendingDebt({ ...debt, estado: 'paid' })).toBe(false);
    expect(buildSettleGroupDebtPayload(debt)).toEqual({
      shared_expense_id: 9,
      debtor_id: 2,
      creditor_id: 1,
      total_amount: 500,
      status: 'paid',
    });
  });

  it('marca la deuda como pagada', async () => {
    patchRequest.mockResolvedValueOnce({ data: { ...debt, estado: 'paid' } });

    await expect(settleGroupDebt(debt)).resolves.toEqual({ ...debt, estado: 'paid' });
    expect(patchRequest).toHaveBeenCalledWith('/group-debts/11', {
      shared_expense_id: 9,
      debtor_id: 2,
      creditor_id: 1,
      total_amount: 500,
      status: 'paid',
    });
  });
});
