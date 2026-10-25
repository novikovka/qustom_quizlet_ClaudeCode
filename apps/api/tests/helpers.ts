import request from 'supertest';
import { app } from '../src/app.js';

// Регистрирует пользователя и возвращает agent, который хранит его cookie
export async function signUp(email: string) {
  const agent = request.agent(app);
  await agent.post('/api/auth/register').send({ email, password: 'password123' }).expect(201);
  return agent;
}

export type Agent = Awaited<ReturnType<typeof signUp>>;

export async function createDeck(agent: Agent, name: string): Promise<number> {
  const res = await agent.post('/api/decks').send({ name }).expect(201);
  return res.body.deck.id;
}

export async function addCard(agent: Agent, deckId: number, en: string, ru: string) {
  const res = await agent.post(`/api/decks/${deckId}/cards`).send({ en, ru }).expect(201);
  return res.body.card.id as number;
}
