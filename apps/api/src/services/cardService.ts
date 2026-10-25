import { prisma } from '../db.js';
import type { CreateCardInput, UpdateCardInput } from '../schemas/cards.js';
import { isOwnDeck } from './deckService.js';

const cardFields = {
  id: true,
  deckId: true,
  en: true,
  ru: true,
  createdAt: true,
  updatedAt: true,
} as const;

// Карточка ищется только среди колод этого пользователя
const ownCard = (userId: number, cardId: number) => ({ id: cardId, deck: { userId } });

// null — колоды нет или она чужая
export async function addCard(userId: number, deckId: number, data: CreateCardInput) {
  if (!(await isOwnDeck(userId, deckId))) return null;
  return prisma.card.create({ data: { deckId, ...data }, select: cardFields });
}

export async function updateCard(userId: number, cardId: number, data: UpdateCardInput) {
  const exists = await prisma.card.count({ where: ownCard(userId, cardId) });
  if (!exists) return null;
  return prisma.card.update({ where: { id: cardId }, data, select: cardFields });
}

export async function deleteCard(userId: number, cardId: number): Promise<boolean> {
  const { count } = await prisma.card.deleteMany({ where: ownCard(userId, cardId) });
  return count > 0;
}
