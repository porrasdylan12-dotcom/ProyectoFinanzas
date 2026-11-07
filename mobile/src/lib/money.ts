export function formatMoney(value: number | string): string {
  const amount = Number(value);

  return `$ ${(Number.isFinite(amount) ? amount : 0).toFixed(2)}`;
}
