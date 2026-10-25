import { Header } from '../components/Header';
import styles from './HomePage.module.css';

// Временная главная страница; экран «Мои колоды» появится на этапе 4
export function HomePage() {
  return (
    <>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Мои колоды</h1>
        <p className={styles.text}>Скоро здесь появятся ваши колоды.</p>
      </main>
    </>
  );
}
