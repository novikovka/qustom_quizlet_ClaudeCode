import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';

const email = 'anna@example.com';
const password = 'password123';

// agent хранит cookie между запросами, как браузер
function register(agent = request.agent(app), body: object = { email, password }) {
  return agent.post('/api/auth/register').send(body);
}

describe('регистрация', () => {
  it('создаёт пользователя и сразу выполняет вход', async () => {
    const agent = request.agent(app);
    const res = await register(agent);

    expect(res.status).toBe(201);
    expect(res.body.user).toEqual({ id: expect.any(Number), email });

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe(email);
  });

  it('хранит пароль только как хеш argon2', async () => {
    await register();
    const user = await prisma.user.findUniqueOrThrow({ where: { email } });

    expect(user.passwordHash).not.toContain(password);
    expect(user.passwordHash).toMatch(/^\$argon2/);
  });

  it('не даёт зарегистрировать занятый email, в том числе другими буквами', async () => {
    await register();

    const same = await register();
    expect(same.status).toBe(409);
    expect(same.body).toEqual({ error: 'Такой email уже зарегистрирован' });

    const upper = await register(undefined, { email: '  Anna@Example.COM ', password });
    expect(upper.status).toBe(409);
  });

  it('отклоняет пароль короче 8 символов', async () => {
    const res = await register(undefined, { email, password: '1234567' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Пароль должен быть не короче 8 символов' });
  });

  it('отклоняет неверный email', async () => {
    const res = await register(undefined, { email: 'not-an-email', password });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Введите корректный email' });
  });

  it('отвечает 400 на тело не в формате JSON', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .set('Content-Type', 'application/json')
      .send('{oops');
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Неверный формат запроса' });
  });
});

describe('вход и выход', () => {
  it('входит с верным паролем', async () => {
    await register();

    const agent = request.agent(app);
    const res = await agent.post('/api/auth/login').send({ email, password });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(200);
  });

  it('не входит с неверным паролем или чужим email — один и тот же ответ', async () => {
    await register();

    const wrongPassword = await request(app)
      .post('/api/auth/login')
      .send({ email, password: 'wrong-password' });
    const unknownEmail = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password });

    for (const res of [wrongPassword, unknownEmail]) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Неверный email или пароль' });
    }
  });

  it('без входа /me отвечает 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Нужно войти' });
  });

  it('после выхода сессия больше не действует', async () => {
    const agent = request.agent(app);
    await register(agent);

    const logout = await agent.post('/api/auth/logout');
    expect(logout.status).toBe(204);

    const me = await agent.get('/api/auth/me');
    expect(me.status).toBe(401);
    expect(await prisma.session.count()).toBe(0);
  });

  it('сохраняет сессию в базе', async () => {
    await register();
    expect(await prisma.session.count()).toBe(1);
  });
});
