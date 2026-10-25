import { useSyncExternalStore } from 'react';

// Телефонная раскладка (DESIGN.md, экраны 11–13)
export const MOBILE = '(max-width: 600px)';

// true, пока экран подходит под медиазапрос; меняется при повороте или изменении окна
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener('change', onChange);
      return () => media.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
  );
}
