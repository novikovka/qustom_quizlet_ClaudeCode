import styles from './Logo.module.css';

// Две наложенные карточки: коралловая повёрнута, сверху фиолетовая с «Aa»
export function Logo() {
  return (
    <span className={styles.logo}>
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.back} />
        <span className={styles.front}>Aa</span>
      </span>
      <span className={styles.text}>Карточки</span>
    </span>
  );
}
