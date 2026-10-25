import type { ReactNode } from 'react';
import { Logo } from './Logo';
import styles from './AuthLayout.module.css';

// Экраны входа и регистрации: белая карточка по центру, вокруг — декор
export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className={styles.page}>
      <div className={styles.decor} aria-hidden="true">
        <span className={`${styles.circle} ${styles.circleViolet}`} />
        <span className={`${styles.circle} ${styles.circleCoral}`} />
        <span className={`${styles.circle} ${styles.circleMint}`} />
        <span className={`${styles.sticker} ${styles.stickerEn}`}>hello</span>
        <span className={`${styles.sticker} ${styles.stickerRu}`}>привет</span>
        <svg className={styles.star} viewBox="0 0 24 24">
          <path d="M12 0c.6 6.6 5.4 11.4 12 12-6.6.6-11.4 5.4-12 12-.6-6.6-5.4-11.4-12-12C6.6 11.4 11.4 6.6 12 0z" />
        </svg>
      </div>

      <main className={styles.card}>
        <Logo />
        <h1 className={styles.title}>{title}</h1>
        {children}
      </main>
    </div>
  );
}
