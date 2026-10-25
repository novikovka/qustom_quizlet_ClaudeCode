import type { Prisma } from '@prisma/client';
import { prisma } from '../db.js';

// Цветов колод шесть (DESIGN.md, раздел 2); цвет берётся по порядку создания
const DECK_COLORS = 6;
// Сколько первых карточек отдаём в списке колод для обложки и строки «слово · слово · слово»
const PREVIEW_CARDS = 3;

const cardFields = { id: true, en: true, ru: true, createdAt: true, updatedAt: true } as const;
const cardOrder: Prisma.CardOrderByWithRelationInput[] = [{ createdAt: 'asc' }, { id: 'asc' }];

export async function listDecks(userId: number) {
  const decks = await prisma.deck.findMany({
    where: { userId },
    orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { cards: true } },
      cards: { select: { en: true, ru: true }, orderBy: cardOrder, take: PREVIEW_CARDS },
    },
  });

  return decks.map(({ _count, cards, ...deck }, index) => ({
    ...deck,
    cardCount: _count.cards,
    colorIndex: index % DECK_COLORS,
    previewCards: cards,
  }));
}

// Колода пользователя с карточками или null, если колоды нет или она чужая
export async function getDeck(userId: number, deckId: number) {
  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      cards: { select: cardFields, orderBy: cardOrder },
    },
  });
  if (!deck) return null;

  return {
    ...deck,
    cardCount: deck.cards.length,
    colorIndex: await colorIndexOf(userId, deckId),
  };
}

export async function createDeck(userId: number, name: string) {
  const deck = await prisma.deck.create({
    data: { userId, name },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
  return {
    ...deck,
    cardCount: 0,
    colorIndex: await colorIndexOf(userId, deck.id),
    previewCards: [],
  };
}

export async function renameDeck(userId: number, deckId: number, name: string) {
  if (!(await isOwnDeck(userId, deckId))) return null;
  const deck = await prisma.deck.update({
    where: { id: deckId },
    data: { name },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { cards: true } },
    },
  });
  const { _count, ...rest } = deck;
  return { ...rest, cardCount: _count.cards, colorIndex: await colorIndexOf(userId, deckId) };
}

// Удаляет колоду вместе с карточками (каскад в базе). false — колоды нет или она чужая
export async function deleteDeck(userId: number, deckId: number): Promise<boolean> {
  const { count } = await prisma.deck.deleteMany({ where: { id: deckId, userId } });
  return count > 0;
}

export async function isOwnDeck(userId: number, deckId: number): Promise<boolean> {
  return (await prisma.deck.count({ where: { id: deckId, userId } })) > 0;
}

// Номер колоды среди колод пользователя по порядку создания, по кругу из шести.
// id растёт вместе со временем создания, поэтому достаточно посчитать колоды с меньшим id
async function colorIndexOf(userId: number, deckId: number): Promise<number> {
  const before = await prisma.deck.count({ where: { userId, id: { lt: deckId } } });
  return before % DECK_COLORS;
}
