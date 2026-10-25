import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { decksApi, type DeckBase, type DeckSummary } from '../api/decks';
import { cardsText, decksText } from '../lib/plural';
import { useToast } from '../toast/useToast';
import { Button } from '../components/Button';
import { PlusIcon, StarIcon } from '../components/icons';
import { Skeleton } from '../components/Skeleton';
import { LoadError } from '../components/LoadError';
import { MOBILE, useMediaQuery } from '../lib/useMediaQuery';
import { DeckCard } from '../components/decks/DeckCard';
import { DeckRow } from '../components/decks/DeckRow';
import { EmptyDecks } from '../components/decks/EmptyDecks';
import { NewDeckModal } from '../components/decks/NewDeckModal';
import { RenameDeckModal } from '../components/decks/RenameDeckModal';
import { DeleteDeckModal } from '../components/decks/DeleteDeckModal';
import styles from './DecksPage.module.css';

type Load =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; decks: DeckSummary[] };

type Dialog =
  { type: 'new' } | { type: 'rename'; deck: DeckBase } | { type: 'delete'; deck: DeckBase } | null;

// Экран «Мои колоды» (DESIGN.md, экраны 1–3, 6, 9)
export function DecksPage() {
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [dialog, setDialog] = useState<Dialog>(null);
  const navigate = useNavigate();
  const toast = useToast();
  const mobile = useMediaQuery(MOBILE);

  const fetchDecks = useCallback(
    () =>
      decksApi
        .list()
        .then((decks) => setLoad({ status: 'ready', decks }))
        .catch((error) => setLoad({ status: 'error', error })),
    [],
  );

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const retry = () => {
    setLoad({ status: 'loading' });
    fetchDecks();
  };

  // Сервер вернул обновлённую колоду — меняем её в списке без перезагрузки
  const updateDeck = (changed: DeckBase) =>
    setLoad((prev) =>
      prev.status === 'ready'
        ? {
            ...prev,
            decks: prev.decks.map((d) => (d.id === changed.id ? { ...d, ...changed } : d)),
          }
        : prev,
    );

  const removeDeck = (id: number) =>
    setLoad((prev) =>
      prev.status === 'ready' ? { ...prev, decks: prev.decks.filter((d) => d.id !== id) } : prev,
    );

  const decks = load.status === 'ready' ? load.decks : [];
  const totalCards = decks.reduce((sum, d) => sum + d.cardCount, 0);
  // Цвет новой колоды — следующий по кругу после последней
  const nextColor = decks.length ? decks[decks.length - 1].colorIndex + 1 : 0;

  return (
    <main className={styles.main}>
      {load.status === 'loading' && <DecksSkeleton />}

      {load.status === 'error' && <LoadError error={load.error} what="Колоды" onRetry={retry} />}

      {load.status === 'ready' && decks.length === 0 && (
        <EmptyDecks onCreate={() => setDialog({ type: 'new' })} />
      )}

      {load.status === 'ready' && decks.length > 0 && (
        <>
          <section className={styles.hero}>
            <div>
              <h1 className={styles.title}>Мои колоды</h1>
              <p className={styles.stats}>
                {decksText(decks.length)} · {cardsText(totalCards)}
              </p>
              {!mobile && (
                <Button className={styles.newButton} onClick={() => setDialog({ type: 'new' })}>
                  <PlusIcon size={18} />
                  Новая колода
                </Button>
              )}
            </div>
            <HeroArt />
          </section>

          {mobile ? (
            // Телефон: колоды списком и плавающая кнопка «+» (DESIGN.md, экран 11)
            <>
              <ul className={styles.list}>
                {decks.map((deck, i) => (
                  <DeckRow
                    key={deck.id}
                    deck={deck}
                    index={i}
                    onRename={() => setDialog({ type: 'rename', deck })}
                    onDelete={() => setDialog({ type: 'delete', deck })}
                  />
                ))}
              </ul>
              <button
                type="button"
                className={styles.fab}
                aria-label="Новая колода"
                onClick={() => setDialog({ type: 'new' })}
              >
                <PlusIcon size={26} />
              </button>
            </>
          ) : (
            <div className={styles.grid}>
              {decks.map((deck, i) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  index={i}
                  onRename={() => setDialog({ type: 'rename', deck })}
                  onDelete={() => setDialog({ type: 'delete', deck })}
                />
              ))}
            </div>
          )}
        </>
      )}

      {dialog?.type === 'new' && (
        <NewDeckModal
          colorIndex={nextColor}
          onClose={() => setDialog(null)}
          onCreated={(deck) => {
            toast({ kind: 'success', message: `Колода «${deck.name}» создана` });
            // Сразу открываем новую колоду, чтобы добавить в неё карточки
            navigate(`/decks/${deck.id}`);
          }}
        />
      )}

      {dialog?.type === 'rename' && (
        <RenameDeckModal
          deck={dialog.deck}
          onClose={() => setDialog(null)}
          onRenamed={(deck) => {
            updateDeck(deck);
            setDialog(null);
            toast({ kind: 'success', message: `Колода переименована в «${deck.name}»` });
          }}
        />
      )}

      {dialog?.type === 'delete' && (
        <DeleteDeckModal
          deck={dialog.deck}
          onClose={() => setDialog(null)}
          onDeleted={(deck) => {
            removeDeck(deck.id);
            setDialog(null);
            toast({ kind: 'info', message: `Колода «${deck.name}» удалена` });
          }}
        />
      )}
    </main>
  );
}

// Справа от заголовка: две парящие карточки, вращающийся пунктирный круг, звёздочка
function HeroArt() {
  return (
    <div className={styles.art} aria-hidden="true">
      <span className={styles.ring} />
      <span className={`${styles.artCard} ${styles.artEn}`}>give up</span>
      <span className={`${styles.artCard} ${styles.artRu}`}>сдаваться</span>
      <StarIcon className={styles.artStar} size={22} />
    </div>
  );
}

function DecksSkeleton() {
  return (
    <div aria-busy="true" aria-label="Загрузка колод">
      <Skeleton style={{ width: 280, height: 52, marginBottom: 12 }} />
      <Skeleton style={{ width: 200, height: 20, marginBottom: 36 }} />
      <div className={styles.grid}>
        {[0, 1, 2].map((i) => (
          <div key={i} className={styles.skeletonCard}>
            <Skeleton style={{ height: 128, borderRadius: 0 }} />
            <div className={styles.skeletonBody}>
              <Skeleton style={{ width: '60%', height: 22 }} />
              <Skeleton style={{ width: '35%', height: 16 }} />
              <Skeleton style={{ height: 44, marginTop: 12 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
