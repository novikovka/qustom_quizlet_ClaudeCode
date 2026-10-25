import { Link, useParams } from 'react-router';
import { buttonClass } from '../components/buttonClass';
import styles from './DeckPage.module.css';

// Временная заглушка: просмотр карточек появится на этапе 5
export function StudyPage() {
  const { id } = useParams();
  return (
    <main className={styles.main}>
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Скоро здесь можно будет листать карточки</h1>
        <p className={styles.notFoundText}>Просмотр с переворотом появится на следующем этапе.</p>
        <Link to={`/decks/${id}`} className={buttonClass()}>
          Вернуться к колоде
        </Link>
      </div>
    </main>
  );
}
