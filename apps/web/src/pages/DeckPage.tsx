import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { decksApi, type Card, type DeckDetail } from '../api/decks';
import { ApiError } from '../api/client';
import { deckColorVars } from '../lib/deckColors';
import { cardsText } from '../lib/plural';
import { useToast } from '../toast/useToast';
import { buttonClass } from '../components/buttonClass';
import { Button, IconButton } from '../components/Button';
import { ChevronLeftIcon, PencilIcon, PlayIcon } from '../components/icons';
import { Skeleton } from '../components/Skeleton';
import { LoadError } from '../components/LoadError';
import { RenameDeckModal } from '../components/decks/RenameDeckModal';
import { CardForm } from '../components/deck/CardForm';
import { CardTable } from '../components/deck/CardTable';
import { EmptyCards } from '../components/deck/EmptyCards';
import styles from './DeckPage.module.css';

type Load =
  | { status: 'loading' }
  | { status: 'notFound' }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; deck: DeckDetail };

const SAVE_FAILED = 'Не удалось сохранить. Попробуйте ещё раз';

// Экран «Колода» (DESIGN.md, экраны 4–6)
export function DeckPage() {
  const { id } = useParams();
  const deckId = Number(id);
  const [load, setLoad] = useState<Load>({ status: 'loading' });
  const [renaming, setRenaming] = useState(false);
  const [highlightId, setHighlightId] = useState<number | null>(null);
  const toast = useToast();

  const fetchDeck = useCallback(
    () =>
      decksApi
        .get(deckId)
        .then((deck) => setLoad({ status: 'ready', deck }))
        .catch((error) =>
          setLoad(
            error instanceof ApiError && error.status === 404
              ? { status: 'notFound' }
              : { status: 'error', error },
          ),
        ),
    [deckId],
  );

  useEffect(() => {
    fetchDeck();
  }, [fetchDeck]);

  // Меняет колоду, только если она уже загружена
  const updateDeck = (change: (deck: DeckDetail) => DeckDetail) =>
    setLoad((prev) => (prev.status === 'ready' ? { ...prev, deck: change(prev.deck) } : prev));

  async function addCard(en: string, ru: string): Promise<boolean> {
    try {
      const card = await decksApi.addCard(deckId, en, ru);
      updateDeck((d) => ({ ...d, cards: [...d.cards, card], cardCount: d.cardCount + 1 }));
      setHighlightId(card.id);
      toast({ kind: 'success', message: `Карточка «${card.en}» добавлена` });
      return true;
    } catch {
      toast({
        kind: 'error',
        message: SAVE_FAILED,
        action: { label: 'Повторить', onClick: () => addCard(en, ru) },
      });
      return false;
    }
  }

  async function saveCard(cardId: number, en: string, ru: string): Promise<boolean> {
    try {
      const card = await decksApi.updateCard(cardId, en, ru);
      updateDeck((d) => ({ ...d, cards: d.cards.map((c) => (c.id === card.id ? card : c)) }));
      return true;
    } catch {
      toast({
        kind: 'error',
        message: SAVE_FAILED,
        action: { label: 'Повторить', onClick: () => saveCard(cardId, en, ru) },
      });
      return false;
    }
  }

  async function deleteCard(card: Card) {
    try {
      await decksApi.deleteCard(card.id);
      updateDeck((d) => ({
        ...d,
        cards: d.cards.filter((c) => c.id !== card.id),
        cardCount: d.cardCount - 1,
      }));
      toast({ kind: 'info', message: 'Карточка удалена' });
    } catch {
      toast({
        kind: 'error',
        message: 'Не удалось удалить карточку',
        action: { label: 'Повторить', onClick: () => deleteCard(card) },
      });
    }
  }

  return (
    <main className={styles.main}>
      <Link to="/" className={styles.back}>
        <ChevronLeftIcon size={18} />
        Все колоды
      </Link>

      {load.status === 'loading' && <DeckSkeleton />}

      {load.status === 'error' && (
        <LoadError
          error={load.error}
          what="Карточки"
          onRetry={() => {
            setLoad({ status: 'loading' });
            fetchDeck();
          }}
        />
      )}

      {load.status === 'notFound' && (
        <div className={styles.notFound}>
          <h1 className={styles.notFoundTitle}>Колода не найдена</h1>
          <p className={styles.notFoundText}>Возможно, её удалили или ссылка неверная.</p>
          <Link to="/" className={buttonClass()}>
            Ко всем колодам
          </Link>
        </div>
      )}

      {load.status === 'ready' && (
        <>
          <section className={styles.header} style={deckColorVars(load.deck.colorIndex)}>
            <span className={`${styles.circle} ${styles.circleBig}`} aria-hidden="true" />
            <span className={`${styles.circle} ${styles.circleSmall}`} aria-hidden="true" />
            <div className={styles.headerText}>
              <span className={styles.label}>Колода</span>
              <div className={styles.nameRow}>
                <h1 className={styles.name}>{load.deck.name}</h1>
                <IconButton
                  aria-label="Переименовать колоду"
                  className={styles.renameButton}
                  onClick={() => setRenaming(true)}
                >
                  <PencilIcon />
                </IconButton>
              </div>
              <p className={styles.count}>{cardsText(load.deck.cardCount)}</p>
            </div>
            {load.deck.cardCount > 0 ? (
              <Link to={`/decks/${deckId}/study`} className={buttonClass()}>
                <PlayIcon size={16} />
                Листать карточки
              </Link>
            ) : (
              <Button disabled className={styles.studyDisabled}>
                <PlayIcon size={16} />
                Листать — нужна хотя бы 1 карточка
              </Button>
            )}
          </section>

          <CardForm onAdd={addCard} />

          <section className={styles.list} aria-label="Карточки колоды">
            {load.deck.cards.length > 0 ? (
              <CardTable
                cards={load.deck.cards}
                highlightId={highlightId}
                onSave={saveCard}
                onDelete={deleteCard}
              />
            ) : (
              <EmptyCards />
            )}
          </section>

          {renaming && (
            <RenameDeckModal
              deck={load.deck}
              onClose={() => setRenaming(false)}
              onRenamed={(deck) => {
                updateDeck((d) => ({ ...d, name: deck.name }));
                setRenaming(false);
                toast({ kind: 'success', message: `Колода переименована в «${deck.name}»` });
              }}
            />
          )}
        </>
      )}
    </main>
  );
}

function DeckSkeleton() {
  return (
    <div aria-busy="true" aria-label="Загрузка колоды">
      <Skeleton style={{ height: 180, borderRadius: 26, marginBottom: 22 }} />
      <Skeleton style={{ height: 130, borderRadius: 22, marginBottom: 22 }} />
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} style={{ height: 52, marginBottom: 10 }} />
      ))}
    </div>
  );
}
