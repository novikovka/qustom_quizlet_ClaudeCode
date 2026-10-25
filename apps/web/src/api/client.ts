// Ошибка запроса с понятным пользователю текстом
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = { method?: string; body?: unknown };

// Запрос к нашему API. Ошибку сервера { "error": "..." } превращает в ApiError
export async function api<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Нет связи с сервером', 0);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    // Ответ без JSON с кодом 5xx приходит от прокси Vite, когда сервер не запущен
    if (!data && res.status >= 500) {
      throw new ApiError('Нет связи с сервером', res.status);
    }
    throw new ApiError(data?.error ?? 'Что-то пошло не так. Попробуйте ещё раз', res.status);
  }
  return data as T;
}
