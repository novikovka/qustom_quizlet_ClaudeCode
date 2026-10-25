// Быстрая проверка email в браузере; окончательную проверку делает сервер
export function validateEmail(email: string): string | undefined {
  const value = email.trim();
  if (!value) return 'Введите email';
  if (!/^\S+@\S+\.\S+$/.test(value)) return 'Введите корректный email';
  return undefined;
}
