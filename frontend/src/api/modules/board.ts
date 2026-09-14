import type { Card, Goal } from '../../types/board';
import { apiRequest } from '../api';

export type BoardDto = { cards: Card[]; goals: Goal[] };

export function getBoard(): Promise<BoardDto> {
  return apiRequest('/api/board');
}
