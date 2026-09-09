import { v4 as uuid } from 'uuid';
import type { Card, DayHistoryEntry, Goal } from '../../types/board';

/**
 * Same 5 example cards and 4 example goals as the design handoff
 * (`Kanban.dc.html`) and the seed planned for Fase 3 item 7 — kept identical
 * so the backend seed does not diverge from what Fase 1 was reviewed against.
 */
export function buildSeedCards(): Card[] {
  const proposalCardId = uuid();

  return [
    {
      id: uuid(),
      columnKey: 'backlog',
      title: 'Revisar anotações da semana',
      priority: 0,
      tag: -1,
      position: 1,
      poms: 0,
      subtasks: [],
    },
    {
      id: uuid(),
      columnKey: 'today',
      title: 'Responder e-mails pendentes',
      priority: 2,
      tag: 0,
      position: 1,
      poms: 0,
      subtasks: [],
    },
    {
      id: uuid(),
      columnKey: 'today',
      title: 'Treino 40 min',
      priority: 0,
      tag: 2,
      position: 2,
      poms: 0,
      subtasks: [],
    },
    {
      id: proposalCardId,
      columnKey: 'doing',
      title: 'Montar proposta do projeto novo',
      priority: 1,
      tag: 0,
      position: 1,
      poms: 0,
      subtasks: [
        {
          id: uuid(),
          cardId: proposalCardId,
          title: 'Levantar escopo',
          done: true,
          position: 1,
        },
        {
          id: uuid(),
          cardId: proposalCardId,
          title: 'Estimar prazo',
          done: false,
          position: 2,
        },
      ],
    },
    {
      id: uuid(),
      columnKey: 'done',
      title: 'Planejar o dia',
      priority: 0,
      tag: -1,
      position: 1,
      poms: 0,
      subtasks: [],
    },
  ];
}

export function buildSeedGoals(): Goal[] {
  return [
    { id: uuid(), scope: 'week', title: 'Fechar relatório mensal', done: false, position: 1 },
    { id: uuid(), scope: 'week', title: 'Agendar consulta', done: true, position: 2 },
    { id: uuid(), scope: 'month', title: 'Terminar curso de dados', done: false, position: 1 },
    {
      id: uuid(),
      scope: 'month',
      title: 'Organizar finanças do trimestre',
      done: false,
      position: 2,
    },
  ];
}

/** 14 days of mock activity, today last, todays value highlighted by the chart itself. */
export function buildSeedHistory(): DayHistoryEntry[] {
  const values = [20, 0, 45, 30, 0, 50, 25, 10, 0, 35, 40, 0, 20, 30];
  const today = new Date();
  return values.map((xp, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (values.length - 1 - index));
    return {
      day: day.toISOString().slice(0, 10),
      xp,
      done: xp > 0 ? Math.max(1, Math.round(xp / 20)) : 0,
    };
  });
}
