package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.entity.Goal;
import br.com.oaksd.kanban.entity.Subtask;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.GoalRepository;
import br.com.oaksd.kanban.repository.SubtaskRepository;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * The 5 example cards and 4 example goals from the design handoff
 * (frontend/src/pages/Board/mockSeed.ts, kept identical on purpose — PLAN.md item 7). Called
 * from AuthService.register inside the same transaction as account creation.
 */
@Component
public class BoardSeedService {

  private final CardRepository cardRepository;
  private final SubtaskRepository subtaskRepository;
  private final GoalRepository goalRepository;
  private final PositionService positionService;

  public BoardSeedService(CardRepository cardRepository, SubtaskRepository subtaskRepository,
      GoalRepository goalRepository, PositionService positionService) {
    this.cardRepository = cardRepository;
    this.subtaskRepository = subtaskRepository;
    this.goalRepository = goalRepository;
    this.positionService = positionService;
  }

  public void seed(UUID userId) {
    seedCard(userId, "backlog", "Revisar anotações da semana", (short) 0, (short) -1, List.of());
    seedCard(userId, "today", "Responder e-mails pendentes", (short) 2, (short) 0, List.of());
    seedCard(userId, "today", "Treino 40 min", (short) 0, (short) 2, List.of());
    seedCard(userId, "doing", "Montar proposta do projeto novo", (short) 1, (short) 0, List.of(
        new SeedSubtask("Levantar escopo", true),
        new SeedSubtask("Estimar prazo", false)));
    seedCard(userId, "done", "Planejar o dia", (short) 0, (short) -1, List.of());

    seedGoal(userId, "week", "Fechar relatório mensal", false);
    seedGoal(userId, "week", "Agendar consulta", true);
    seedGoal(userId, "month", "Terminar curso de dados", false);
    seedGoal(userId, "month", "Organizar finanças do trimestre", false);
  }

  private void seedCard(UUID userId, String column, String title, short priority, short tag,
      List<SeedSubtask> subtasks) {
    Card card = new Card();
    card.setId(UUID.randomUUID());
    card.setUserId(userId);
    card.setColumnKey(column);
    card.setTitle(title);
    card.setPriority(priority);
    card.setTag(tag);
    card.setPosition(positionService.appendAfter(
        cardRepository.findTopByUserIdAndColumnKeyOrderByPositionDesc(userId, column).map(Card::getPosition)));
    cardRepository.save(card);

    for (SeedSubtask seedSubtask : subtasks) {
      Subtask subtask = new Subtask();
      subtask.setId(UUID.randomUUID());
      subtask.setCardId(card.getId());
      subtask.setTitle(seedSubtask.title());
      subtask.setDone(seedSubtask.done());
      subtask.setPosition(positionService.appendAfter(
          subtaskRepository.findTopByCardIdOrderByPositionDesc(card.getId()).map(Subtask::getPosition)));
      subtaskRepository.save(subtask);
    }
  }

  private void seedGoal(UUID userId, String scope, String title, boolean done) {
    Goal goal = new Goal();
    goal.setId(UUID.randomUUID());
    goal.setUserId(userId);
    goal.setScope(scope);
    goal.setTitle(title);
    goal.setDone(done);
    goal.setPosition(positionService.appendAfter(
        goalRepository.findTopByUserIdAndScopeOrderByPositionDesc(userId, scope).map(Goal::getPosition)));
    goalRepository.save(goal);
  }

  private record SeedSubtask(String title, boolean done) {
  }
}
