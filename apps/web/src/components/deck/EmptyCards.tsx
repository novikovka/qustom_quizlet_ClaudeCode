import { ArrowUpIcon } from '../icons';
import styles from './EmptyCards.module.css';

// В колоде нет карточек — подсказка вместо таблицы (DESIGN.md, экран 5)
export function EmptyCards() {
  return (
    <div className={styles.box}>
      <span className={styles.arrow} aria-hidden="true">
        <ArrowUpIcon size={26} />
      </span>
      <div className={styles.cards} aria-hidden="true">
        <span className={styles.card} />
        <span className={styles.card} />
      </div>
      <h2 className={styles.title}>В колоде пока нет карточек</h2>
      <p className={styles.text}>
        Добавьте первую карточку через форму выше — она сразу появится в этом списке.
      </p>
    </div>
  );
}
