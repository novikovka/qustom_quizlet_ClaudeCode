import { Button } from '../Button';
import { PlusIcon, StarIcon } from '../icons';
import styles from './EmptyDecks.module.css';

const STEPS = [
  { title: 'Создайте колоду', text: 'Назовите её по теме, учебнику или фильму.' },
  { title: 'Добавьте слова', text: 'Английское слово или фразу и перевод.' },
  { title: 'Листайте', text: 'Переворачивайте карточки, пока не запомните.' },
];

// Первый запуск — колод ещё нет (DESIGN.md, экран 2)
export function EmptyDecks({ onCreate }: { onCreate: () => void }) {
  return (
    <section className={styles.wrap}>
      <div className={styles.art} aria-hidden="true">
        <span className={`${styles.fan} ${styles.fanLeft}`} />
        <span className={`${styles.fan} ${styles.fanRight}`} />
        <span className={`${styles.fan} ${styles.fanFront}`}>
          <span className={styles.plus}>
            <PlusIcon size={22} />
          </span>
          hello
        </span>
        <StarIcon className={`${styles.star} ${styles.star1}`} size={22} />
        <StarIcon className={`${styles.star} ${styles.star2}`} size={14} />
        <StarIcon className={`${styles.star} ${styles.star3}`} size={18} />
      </div>

      <h1 className={styles.title}>Пока нет ни одной колоды</h1>
      <p className={styles.text}>
        Создайте колоду, например «Phrasal verbs», и добавьте в неё слова, которые хотите запомнить.
      </p>
      <Button className={styles.cta} onClick={onCreate}>
        <PlusIcon size={18} />
        Создать первую колоду
      </Button>

      <ol className={styles.steps}>
        {STEPS.map((step, i) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.stepNumber} data-step={i}>
              {i + 1}
            </span>
            <span className={styles.stepTitle}>{step.title}</span>
            <span className={styles.stepText}>{step.text}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
