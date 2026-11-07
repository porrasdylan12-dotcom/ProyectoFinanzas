import { apiClient } from './apiClient';
import type { PaginatedResponse } from './pagination';

export interface Account {
  id: number;
  nombre: string;
  saldo: string | number;
  tipo: string;
}

export interface Budget {
  id: number;
  categoria_id: number;
  nombre: string;
  monto_maximo: string | number;
  mes: number;
  año: number;
}

export interface GroupDebt {
  id: number;
  deudor_id: number;
  acreedor_id: number;
  monto_total: string | number;
  estado: string;
}

export interface Transaction {
  id: number;
  categoria_id: number;
  tipo: string;
  monto: number;
  fecha: string;
}

export interface PanelSummary {
  accountsCount: number;
  totalBalance: number;
  budgetsNearLimit: number;
  owedByUser: number;
  owedToUser: number;
}

interface PanelSummaryInput {
  userId: number;
  accounts: Account[];
  budgets: Budget[];
  debts: GroupDebt[];
  expenses: Transaction[];
}

type QueryParams = Record<string, string | number>;

const NEAR_LIMIT_RATIO = 0.8;
const PAGE_SIZE = 50;

function toNumber(value: unknown): number {
  const amount = Number(value ?? 0);

  return Number.isFinite(amount) ? amount : 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildQuery(params: QueryParams): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }

  return search.toString();
}

async function fetchPage<T>(path: string, params: QueryParams): Promise<PaginatedResponse<T>> {
  const query = buildQuery(params);
  const url = query ? `${path}?${query}` : path;

  return apiClient.get<PaginatedResponse<T>>(url);
}

async function fetchAllPages<T>(path: string, params: QueryParams): Promise<T[]> {
  const firstPage = await fetchPage<T>(path, params);
  const items = [...firstPage.data];

  for (let page = 2; page <= firstPage.meta.last_page; page += 1) {
    const nextPage = await fetchPage<T>(path, { ...params, page });
    items.push(...nextPage.data);
  }

  return items;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatMoney(value: number): string {
  return `$ ${(Number.isFinite(value) ? value : 0).toFixed(2)}`;
}

export function buildPanelSummary({ userId, accounts, budgets, debts, expenses }: PanelSummaryInput): PanelSummary {
  const spentByCategory = new Map<number, number>();

  for (const expense of expenses) {
    const categoryId = Number(expense.categoria_id);
    const spent = (spentByCategory.get(categoryId) ?? 0) + toNumber(expense.monto);

    spentByCategory.set(categoryId, spent);
  }

  const budgetsNearLimit = budgets.filter((budget) => {
    const maxAmount = toNumber(budget.monto_maximo);

    if (maxAmount <= 0) {
      return false;
    }

    const spent = spentByCategory.get(Number(budget.categoria_id)) ?? 0;

    return spent >= maxAmount * NEAR_LIMIT_RATIO;
  }).length;

  let owedByUser = 0;
  let owedToUser = 0;

  for (const debt of debts) {
    if (debt.estado !== 'pending') {
      continue;
    }

    const amount = toNumber(debt.monto_total);

    if (Number(debt.deudor_id) === userId) {
      owedByUser += amount;
    }

    if (Number(debt.acreedor_id) === userId) {
      owedToUser += amount;
    }
  }

  const totalBalance = accounts.reduce((total, account) => total + toNumber(account.saldo), 0);

  return {
    accountsCount: accounts.length,
    totalBalance: roundMoney(totalBalance),
    budgetsNearLimit,
    owedByUser: roundMoney(owedByUser),
    owedToUser: roundMoney(owedToUser),
  };
}

export async function loadPanelSummary(userId: number, now = new Date()): Promise<PanelSummary> {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const from = formatDate(new Date(year, month - 1, 1));
  const to = formatDate(new Date(year, month, 0));

  const [accounts, budgets, debts, expenses] = await Promise.all([
    fetchAllPages<Account>('/accounts', { per_page: PAGE_SIZE }),
    fetchAllPages<Budget>('/budgets', { month, year, per_page: PAGE_SIZE }),
    fetchAllPages<GroupDebt>('/group-debts', { status: 'pending', per_page: PAGE_SIZE }),
    fetchAllPages<Transaction>('/transactions', { type: 'gasto', from, to, per_page: PAGE_SIZE }),
  ]);

  return buildPanelSummary({ userId, accounts, budgets, debts, expenses });
}
