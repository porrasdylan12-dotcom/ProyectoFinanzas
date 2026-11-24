import { apiClient } from './apiClient';

export const DEBT_STATUSES = ['pending', 'paid'] as const;

export type DebtStatus = (typeof DEBT_STATUSES)[number];

export interface GroupDebt {
  id: number;
  gasto_compartido_id: number;
  deudor_id: number;
  acreedor_id: number;
  monto_total: string | number;
  estado: string;
  creada?: string | null;
  actualizada?: string | null;
}

export interface SettleGroupDebtPayload {
  shared_expense_id: number;
  debtor_id: number;
  creditor_id: number;
  total_amount: number;
  status: 'paid';
}

const DEBT_STATUS_LABELS: Record<DebtStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagada',
};

export function isDebtStatus(value: string): value is DebtStatus {
  return (DEBT_STATUSES as readonly string[]).includes(value);
}

export function debtStatusLabel(status: string): string {
  return isDebtStatus(status) ? DEBT_STATUS_LABELS[status] : status;
}

export function isPendingDebt(debt: GroupDebt): boolean {
  return debt.estado === 'pending';
}

export function buildSettleGroupDebtPayload(debt: GroupDebt): SettleGroupDebtPayload {
  return {
    shared_expense_id: debt.gasto_compartido_id,
    debtor_id: debt.deudor_id,
    creditor_id: debt.acreedor_id,
    total_amount: Number(debt.monto_total),
    status: 'paid',
  };
}

export async function settleGroupDebt(debt: GroupDebt): Promise<GroupDebt> {
  const response = await apiClient.patch<{ data: GroupDebt }>(
    `/group-debts/${debt.id}`,
    buildSettleGroupDebtPayload(debt),
  );

  return response.data;
}
