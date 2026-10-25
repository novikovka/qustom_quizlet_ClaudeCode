import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';

// В сессии храним только id вошедшего пользователя
declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export const SESSION_COOKIE = 'sid';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function createSessionMiddleware() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET не задан в apps/api/.env');
  }

  const PgStore = connectPgSimple(session);

  return session({
    // Таблица session создана миграцией Prisma, поэтому сам пакет её не создаёт
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      tableName: 'session',
      createTableIfMissing: false,
    }),
    name: SESSION_COOKIE,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: THIRTY_DAYS_MS,
    },
  });
}
