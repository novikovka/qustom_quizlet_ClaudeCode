import { Router, type Response } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateBody } from '../middleware/validate.js';
import { deckSchema, type DeckInput } from '../schemas/decks.js';
import { createCardSchema, type CreateCardInput } from '../schemas/cards.js';
import { createDeck, deleteDeck, getDeck, listDecks, renameDeck } from '../services/deckService.js';
import { addCard } from '../services/cardService.js';
import { parseId } from './params.js';

export const decksRouter = Router();

decksRouter.use(requireAuth);

// Чужая и несуществующая колода выглядят одинаково
const deckNotFound = (res: Response) => res.status(404).json({ error: 'Колода не найдена' });

decksRouter.get('/', async (req, res) => {
  res.json({ decks: await listDecks(req.session.userId!) });
});

decksRouter.post('/', validateBody(deckSchema), async (req, res) => {
  const { name } = req.body as DeckInput;
  res.status(201).json({ deck: await createDeck(req.session.userId!, name) });
});

decksRouter.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const deck = id && (await getDeck(req.session.userId!, id));
  if (!deck) return deckNotFound(res);
  res.json({ deck });
});

decksRouter.patch('/:id', validateBody(deckSchema), async (req, res) => {
  const id = parseId(req.params.id);
  const { name } = req.body as DeckInput;
  const deck = id && (await renameDeck(req.session.userId!, id, name));
  if (!deck) return deckNotFound(res);
  res.json({ deck });
});

decksRouter.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id || !(await deleteDeck(req.session.userId!, id))) return deckNotFound(res);
  res.status(204).end();
});

decksRouter.post('/:id/cards', validateBody(createCardSchema), async (req, res) => {
  const id = parseId(req.params.id);
  const card = id && (await addCard(req.session.userId!, id, req.body as CreateCardInput));
  if (!card) return deckNotFound(res);
  res.status(201).json({ card });
});
