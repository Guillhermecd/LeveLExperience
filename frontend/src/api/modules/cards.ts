import type { BoardColumn, Card, Priority, Tag } from '../../types/board';
import { apiRequest } from '../api';

export function createCard(input: {
  id: string;
  columnKey: BoardColumn;
  title: string;
  priority: Priority;
  tag: Tag;
}): Promise<Card> {
  return apiRequest('/api/cards', { method: 'POST', body: input });
}

export function updateCard(
  cardId: string,
  input: { title: string; priority: Priority; tag: Tag },
): Promise<Card> {
  return apiRequest(`/api/cards/${cardId}`, { method: 'PATCH', body: input });
}

export function moveCard(cardId: string, to: BoardColumn): Promise<Card> {
  return apiRequest(`/api/cards/${cardId}/move`, { method: 'POST', body: { to } });
}

export function deleteCard(cardId: string): Promise<void> {
  return apiRequest(`/api/cards/${cardId}`, { method: 'DELETE' });
}
