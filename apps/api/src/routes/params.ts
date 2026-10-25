// id из адреса: положительное целое число, иначе null.
// Неверный id отвечаем так же, как несуществующий, — 404
export function parseId(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{1,9}$/.test(value)) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}
