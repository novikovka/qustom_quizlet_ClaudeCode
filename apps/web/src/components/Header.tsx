import { Link } from 'react-router';
import { Logo } from './Logo';
import { UserMenu } from './UserMenu';
import styles from './Header.module.css';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.home} aria-label="Карточки — на главную">
          <Logo />
        </Link>
        <div className={styles.right}>
          <span className={styles.tagline}>Английские слова, своими колодами</span>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
