import type { CSSProperties } from 'react';

// Цвета колод из DESIGN.md, раздел 2: светлый — фон, насыщенный — декор, тёмный — текст
export const DECK_COLORS = [
  { light: '#E9E5FF', strong: '#6D5BD0', ink: '#4B3BB8' },
  { light: '#DDEBFF', strong: '#2F7FD8', ink: '#1F5FA8' },
  { light: '#D6F3E8', strong: '#17936F', ink: '#0F6E52' },
  { light: '#FFE4DA', strong: '#E5603D', ink: '#A63B1E' },
  { light: '#FFF1C9', strong: '#C98A00', ink: '#7A5400' },
  { light: '#FCE1EC', strong: '#D2457F', ink: '#9C2A5B' },
];

export function deckColor(index: number) {
  return DECK_COLORS[((index % DECK_COLORS.length) + DECK_COLORS.length) % DECK_COLORS.length];
}

// CSS-переменные --deck-light, --deck-strong, --deck-ink для блока в цвете колоды
export function deckColorVars(index: number): CSSProperties {
  const c = deckColor(index);
  return {
    '--deck-light': c.light,
    '--deck-strong': c.strong,
    '--deck-ink': c.ink,
  } as CSSProperties;
}
