import { Router, type Request } from 'express';
import { validateBody } from '../middleware/validate.js';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  loginSchema,
  registerSchema,
  type LoginInput,
  type RegisterInput,
} from '../schemas/auth.js';
import {
  EmailTakenError,
  findUserById,
  registerUser,
  verifyCredentials,
} from '../services/authService.js';
import { SESSION_COOKIE } from '../session.js';

export const authRouter = Router();

// Создаёт новую сессию для пользователя. Старая сессия заменяется,
// чтобы её id нельзя было подсунуть заранее (защита от фиксации сессии)
function startSession(req: Request, userId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.userId = userId;
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

authRouter.post('/register', validateBody(registerSchema), async (req, res) => {
  const { email, password } = req.body as RegisterInput;
  try {
    const user = await registerUser(email, password);
    await startSession(req, user.id);
    res.status(201).json({ user });
  } catch (err) {
    if (err instanceof EmailTakenError) {
      res.status(409).json({ error: 'Такой email уже зарегистрирован' });
      return;
    }
    throw err;
  }
});

authRouter.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body as LoginInput;
  const user = await verifyCredentials(email, password);
  if (!user) {
    // Один текст и для чужого email, и для неверного пароля
    res.status(401).json({ error: 'Неверный email или пароль' });
    return;
  }
  await startSession(req, user.id);
  res.json({ user });
});

authRouter.post('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie(SESSION_COOKIE);
    res.status(204).end();
  });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.session.userId!);
  if (!user) {
    res.status(401).json({ error: 'Нужно войти' });
    return;
  }
  res.json({ user });
});
