import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { prisma } from '../src/db.js';
import { addCard, createDeck, signUp, type Agent } from './helpers.js';

let anna: Agent;

beforeEach(async () => {
  anna = await signUp('anna@example.com');
});

describe('колоды', () => {
  it('создаёт колоду и обрезает пробелы в названии', async () => {
    const res = await anna.post('/api/decks').send({ name: '  Travel  ' });

    expect(res.status).toBe(201);
    expect(res.body.deck).toMatchObject({
      name: 'Travel',
      cardCount: 0,
      colorIndex: 0,
      previewCards: [],
    });
  });

  it('не создаёт колоду без названия или со слишком длинным', async () => {
    const empty = await anna.post('/api/decks').send({ name: '   ' });
    expect(empty.status).toBe(400);
    expect(empty.body).toEqual({ error: 'Введите название' });

    const long = await anna.post('/api/decks').send({ name: 'x'.repeat(101) });
    expect(long.status).toBe(400);
    expect(long.body).toEqual({ error: 'Название не длиннее 100 символов' });
  });

  it('отдаёт список своих колод по порядку создания с числом карточек и превью', async () => {
    const travel = await createDeck(anna, 'Travel');
    await createDeck(anna, 'Phrasal verbs');
    await addCard(anna, travel, 'luggage', 'багаж');
    await addCard(anna, travel, 'ticket', 'билет');
    await addCard(anna, travel, 'passport', 'паспорт');
    await addCard(anna, travel, 'hotel', 'гостиница');

    const res = await anna.get('/api/decks');

    expect(res.status).toBe(200);
    expect(res.body.decks).toHaveLength(2);
    expect(res.body.decks[0]).toMatchObject({ name: 'Travel', cardCount: 4, colorIndex: 0 });
    expect(res.body.decks[0].previewCards).toEqual([
      { en: 'luggage', ru: 'багаж' },
      { en: 'ticket', ru: 'билет' },
      { en: 'passport', ru: 'паспорт' },
    ]);
    expect(res.body.decks[1]).toMatchObject({ name: 'Phrasal verbs', cardCount: 0, colorIndex: 1 });
  });

  it('цвет идёт по кругу из шести', async () => {
    for (let i = 1; i <= 7; i++) await createDeck(anna, `Колода ${i}`);

    const res = await anna.get('/api/decks');
    expect(res.body.decks.map((d: { colorIndex: number }) => d.colorIndex)).toEqual([
      0, 1, 2, 3, 4, 5, 0,
    ]);
  });

  it('отдаёт колоду с карточками по порядку добавления', async () => {
    await createDeck(anna, 'Первая');
    const id = await createDeck(anna, 'Travel');
    await addCard(anna, id, 'luggage', 'багаж');
    await addCard(anna, id, 'ticket', 'билет');

    const res = await anna.get(`/api/decks/${id}`);

    expect(res.status).toBe(200);
    expect(res.body.deck).toMatchObject({ id, name: 'Travel', cardCount: 2, colorIndex: 1 });
    expect(res.body.deck.cards.map((c: { en: string }) => c.en)).toEqual(['luggage', 'ticket']);
  });

  it('переименовывает колоду', async () => {
    const id = await createDeck(anna, 'Travel');
    await addCard(anna, id, 'luggage', 'багаж');

    const res = await anna.patch(`/api/decks/${id}`).send({ name: 'Путешествия' });

    expect(res.status).toBe(200);
    expect(res.body.deck).toMatchObject({ id, name: 'Путешествия', cardCount: 1 });
  });

  it('удаляет колоду вместе с карточками', async () => {
    const id = await createDeck(anna, 'Travel');
    await addCard(anna, id, 'luggage', 'багаж');

    expect((await anna.delete(`/api/decks/${id}`)).status).toBe(204);
    expect((await anna.get(`/api/decks/${id}`)).status).toBe(404);
    expect(await prisma.card.count()).toBe(0);
  });

  it('на несуществующий или неверный id отвечает 404', async () => {
    for (const id of ['999999', 'abc', '0', '-1', '1.5']) {
      const res = await anna.get(`/api/decks/${id}`);
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Колода не найдена' });
    }
  });
});

describe('карточки', () => {
  let deckId: number;

  beforeEach(async () => {
    deckId = await createDeck(anna, 'Travel');
  });

  it('добавляет карточку и обрезает пробелы', async () => {
    const res = await anna
      .post(`/api/decks/${deckId}/cards`)
      .send({ en: ' carry on ', ru: ' продолжать ' });

    expect(res.status).toBe(201);
    expect(res.body.card).toMatchObject({ deckId, en: 'carry on', ru: 'продолжать' });
  });

  it('не добавляет карточку с пустым словом или переводом', async () => {
    const noEn = await anna.post(`/api/decks/${deckId}/cards`).send({ en: '', ru: 'багаж' });
    expect(noEn.status).toBe(400);
    expect(noEn.body).toEqual({ error: 'Введите слово' });

    const noRu = await anna.post(`/api/decks/${deckId}/cards`).send({ en: 'luggage', ru: ' ' });
    expect(noRu.status).toBe(400);
    expect(noRu.body).toEqual({ error: 'Введите перевод' });
  });

  it('изменяет карточку целиком и по одному полю', async () => {
    const id = await addCard(anna, deckId, 'luggage', 'багаж');

    const both = await anna.patch(`/api/cards/${id}`).send({ en: 'baggage', ru: 'багаж, вещи' });
    expect(both.status).toBe(200);
    expect(both.body.card).toMatchObject({ id, en: 'baggage', ru: 'багаж, вещи' });

    const onlyRu = await anna.patch(`/api/cards/${id}`).send({ ru: 'багаж' });
    expect(onlyRu.body.card).toMatchObject({ en: 'baggage', ru: 'багаж' });
  });

  it('не принимает пустое изменение', async () => {
    const id = await addCard(anna, deckId, 'luggage', 'багаж');

    const nothing = await anna.patch(`/api/cards/${id}`).send({});
    expect(nothing.status).toBe(400);
    expect(nothing.body).toEqual({ error: 'Нечего изменять' });

    const emptyEn = await anna.patch(`/api/cards/${id}`).send({ en: '' });
    expect(emptyEn.status).toBe(400);
    expect(emptyEn.body).toEqual({ error: 'Введите слово' });
  });

  it('удаляет карточку', async () => {
    const id = await addCard(anna, deckId, 'luggage', 'багаж');

    expect((await anna.delete(`/api/cards/${id}`)).status).toBe(204);
    const deck = await anna.get(`/api/decks/${deckId}`);
    expect(deck.body.deck.cards).toEqual([]);
  });

  it('на несуществующую карточку отвечает 404', async () => {
    const res = await anna.patch('/api/cards/999999').send({ en: 'x' });
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Карточка не найдена' });
  });
});

describe('чужие данные (A4)', () => {
  let annaDeck: number;
  let annaCard: number;
  let boris: Agent;

  beforeEach(async () => {
    annaDeck = await createDeck(anna, 'Travel');
    annaCard = await addCard(anna, annaDeck, 'luggage', 'багаж');
    boris = await signUp('boris@example.com');
  });

  it('чужих колод нет в списке', async () => {
    const res = await boris.get('/api/decks');
    expect(res.body.decks).toEqual([]);
  });

  it('чужую колоду нельзя открыть, переименовать, удалить или пополнить — 404', async () => {
    const responses = [
      await boris.get(`/api/decks/${annaDeck}`),
      await boris.patch(`/api/decks/${annaDeck}`).send({ name: 'Взлом' }),
      await boris.delete(`/api/decks/${annaDeck}`),
      await boris.post(`/api/decks/${annaDeck}/cards`).send({ en: 'hack', ru: 'взлом' }),
    ];
    for (const res of responses) {
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Колода не найдена' });
    }
  });

  it('чужую карточку нельзя изменить или удалить — 404', async () => {
    const responses = [
      await boris.patch(`/api/cards/${annaCard}`).send({ en: 'hack' }),
      await boris.delete(`/api/cards/${annaCard}`),
    ];
    for (const res of responses) {
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Карточка не найдена' });
    }
  });

  it('после попыток Бориса данные Анны не изменились', async () => {
    await boris.patch(`/api/decks/${annaDeck}`).send({ name: 'Взлом' });
    await boris.delete(`/api/decks/${annaDeck}`);
    await boris.patch(`/api/cards/${annaCard}`).send({ en: 'hack' });
    await boris.delete(`/api/cards/${annaCard}`);
    await boris.post(`/api/decks/${annaDeck}/cards`).send({ en: 'hack', ru: 'взлом' });

    const res = await anna.get(`/api/decks/${annaDeck}`);
    expect(res.body.deck.name).toBe('Travel');
    expect(res.body.deck.cards).toEqual([expect.objectContaining({ en: 'luggage', ru: 'багаж' })]);
  });
});

describe('без входа', () => {
  it('все адреса колод и карточек отвечают 401', async () => {
    const guest = request(app);
    const responses = [
      await guest.get('/api/decks'),
      await guest.post('/api/decks').send({ name: 'Travel' }),
      await guest.get('/api/decks/1'),
      await guest.patch('/api/decks/1').send({ name: 'Travel' }),
      await guest.delete('/api/decks/1'),
      await guest.post('/api/decks/1/cards').send({ en: 'a', ru: 'б' }),
      await guest.patch('/api/cards/1').send({ en: 'a' }),
      await guest.delete('/api/cards/1'),
    ];
    for (const res of responses) {
      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Нужно войти' });
    }
  });
});
