import { Router, type Response } from 'express';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateBody } from '../middleware/validate.js';
import { updateCardSchema, type UpdateCardInput } from '../schemas/cards.js';
import { deleteCard, updateCard } from '../services/cardService.js';
import { parseId } from './params.js';

export const cardsRouter = Router();

cardsRouter.use(requireAuth);

const cardNotFound = (res: Response) => res.status(404).json({ error: 'Карточка не найдена' });

cardsRouter.patch('/:id', validateBody(updateCardSchema), async (req, res) => {
  const id = parseId(req.params.id);
  const card = id && (await updateCard(req.session.userId!, id, req.body as UpdateCardInput));
  if (!card) return cardNotFound(res);
  res.json({ card });
});

cardsRouter.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id || !(await deleteCard(req.session.userId!, id))) return cardNotFound(res);
  res.status(204).end();
});
