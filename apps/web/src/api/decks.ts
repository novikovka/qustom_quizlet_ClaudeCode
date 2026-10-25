import { api } from './client';

export type CardPreview = { en: string; ru: string };

export type Card = {
  id: number;
  en: string;
  ru: string;
  createdAt: string;
  updatedAt: string;
};

// Общие поля колоды во всех ответах
export type DeckBase = {
  id: number;
  name: string;
  cardCount: number;
  // Номер цвета 0–5 по порядку создания (DESIGN.md, раздел 2)
  colorIndex: number;
};

export type DeckSummary = DeckBase & { previewCards: CardPreview[] };
export type DeckDetail = DeckBase & { cards: Card[] };

export const decksApi = {
  list: () => api<{ decks: DeckSummary[] }>('/decks').then((r) => r.decks),

  get: (id: number) => api<{ deck: DeckDetail }>(`/decks/${id}`).then((r) => r.deck),

  create: (name: string) =>
    api<{ deck: DeckSummary }>('/decks', { method: 'POST', body: { name } }).then((r) => r.deck),

  rename: (id: number, name: string) =>
    api<{ deck: DeckBase }>(`/decks/${id}`, { method: 'PATCH', body: { name } }).then(
      (r) => r.deck,
    ),

  remove: (id: number) => api<void>(`/decks/${id}`, { method: 'DELETE' }),

  addCard: (deckId: number, en: string, ru: string) =>
    api<{ card: Card }>(`/decks/${deckId}/cards`, { method: 'POST', body: { en, ru } }).then(
      (r) => r.card,
    ),

  updateCard: (id: number, en: string, ru: string) =>
    api<{ card: Card }>(`/cards/${id}`, { method: 'PATCH', body: { en, ru } }).then((r) => r.card),

  deleteCard: (id: number) => api<void>(`/cards/${id}`, { method: 'DELETE' }),
};
