package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Gate 3.1: the same xp-rules.json scenario table that runs in Vitest
 * (frontend/src/features/kanban/xpRules.spec.ts) also runs here, against a Java port of the
 * pure reducer (reducer.ts + actions/*.ts + levels.ts). A rule change breaks both suites instead
 * of silently awarding the wrong amount.
 */
class XpRulesTableTest {

  private final XpRuleEngine engine = new XpRuleEngine();

  @Test
  void everyScenarioMatchesTheSharedTable() throws IOException {
    JsonNode root = new ObjectMapper().readTree(getClass().getResourceAsStream("/xp-rules.json"));
    for (JsonNode scenario : root.get("scenarios")) {
      String id = scenario.get("id").asText();
      LocalDate today = LocalDate.parse(scenario.get("given").get("today").asText());

      BoardSimState state = readGiven(scenario.get("given"));
      List<XpEventSim> events = new ArrayList<>();
      for (JsonNode action : scenario.get("actions")) {
        Result result = applyAction(state, action, today);
        state = result.state;
        events.addAll(result.events);
      }

      JsonNode expect = scenario.get("expect");
      assertThat(events).as(id).isEqualTo(readExpectedEvents(expect.get("events")));

      DisplayStats display = projectDisplayStats(state.stats, today);
      assertThat(display.rawTotal()).as(id + ".rawTotal").isEqualTo(expect.get("rawTotal").asInt());
      assertThat(display.xpTotal()).as(id + ".xpTotal").isEqualTo(expect.get("xpTotal").asInt());
      assertThat(display.level()).as(id + ".level").isEqualTo(expect.get("level").asInt());
      assertThat(display.rank()).as(id + ".rank").isEqualTo(expect.get("rank").asText());
      assertThat(display.xpIntoLevel()).as(id + ".xpIntoLevel").isEqualTo(expect.get("xpIntoLevel").asInt());
      assertThat(display.xpForNextLevel()).as(id + ".xpForNextLevel")
          .isEqualTo(expect.get("xpForNextLevel").asInt());
      assertThat(display.streak()).as(id + ".streak").isEqualTo(expect.get("streak").asInt());
      assertThat(display.dayXp()).as(id + ".dayXp").isEqualTo(expect.get("dayXp").asInt());
      assertThat(display.dayDone()).as(id + ".dayDone").isEqualTo(expect.get("dayDone").asInt());
    }
  }

  // ---------------------------------------------------------------------
  // JSON -> simulation state
  // ---------------------------------------------------------------------

  private BoardSimState readGiven(JsonNode given) {
    List<SimCard> cards = new ArrayList<>();
    given.get("cards").forEach(n -> cards.add(
        new SimCard(n.get("id").asText(), n.get("column").asText(), (short) n.get("priority").asInt())));
    List<SimGoal> goals = new ArrayList<>();
    given.get("goals").forEach(n -> goals.add(
        new SimGoal(n.get("id").asText(), n.get("scope").asText(), n.get("done").asBoolean())));
    List<SimSubtask> subtasks = new ArrayList<>();
    given.get("subtasks").forEach(n -> subtasks.add(
        new SimSubtask(n.get("id").asText(), n.get("cardId").asText(), n.get("done").asBoolean())));

    JsonNode s = given.get("stats");
    LedgerStats stats = new LedgerStats(
        s.get("rawTotal").asInt(),
        s.get("streak").asInt(),
        s.get("lastXpDay").isNull() ? null : LocalDate.parse(s.get("lastXpDay").asText()),
        s.get("cleanDayPaid").isNull() ? null : LocalDate.parse(s.get("cleanDayPaid").asText()),
        s.get("dayXp").asInt(),
        s.get("dayDone").asInt());

    return new BoardSimState(cards, goals, subtasks, stats);
  }

  private List<XpEventSim> readExpectedEvents(JsonNode eventsNode) {
    List<XpEventSim> events = new ArrayList<>();
    eventsNode.forEach(n -> events.add(new XpEventSim(
        n.get("reason").asText(),
        n.get("delta").asInt(),
        n.get("refId").isNull() ? null : n.get("refId").asText())));
    return events;
  }

  // ---------------------------------------------------------------------
  // Pure simulation — Java port of reducer.ts / actions/*.ts / levels.ts
  // ---------------------------------------------------------------------

  private record SimCard(String id, String column, short priority) {
  }

  private record SimGoal(String id, String scope, boolean done) {
  }

  private record SimSubtask(String id, String cardId, boolean done) {
  }

  private record LedgerStats(int rawTotal, int streak, LocalDate lastXpDay, LocalDate cleanDayPaid, int dayXp,
      int dayDone) {
  }

  private record BoardSimState(List<SimCard> cards, List<SimGoal> goals, List<SimSubtask> subtasks,
      LedgerStats stats) {
  }

  private record XpEventSim(String reason, int delta, String refId) {
  }

  private record DisplayStats(int rawTotal, int xpTotal, int level, String rank, int xpIntoLevel,
      int xpForNextLevel, int streak, int dayXp, int dayDone) {
  }

  private record Result(BoardSimState state, List<XpEventSim> events) {
  }

  private static final List<XpEventSim> NO_EVENTS = List.of();

  private Result applyAction(BoardSimState state, JsonNode action, LocalDate today) {
    String type = action.get("type").asText();
    return switch (type) {
      case "move_card" -> applyMoveCard(state, action.get("cardId").asText(), action.get("to").asText(), today);
      case "toggle_goal" ->
          applyToggleGoal(state, action.get("goalId").asText(), action.get("done").asBoolean(), today);
      case "toggle_subtask" ->
          applyToggleSubtask(state, action.get("subtaskId").asText(), action.get("done").asBoolean(), today);
      case "finish_focus" -> applyFinishFocus(state, action.get("cardId").asText(),
          action.get("plannedMinutes").asInt(), action.get("elapsedMinutes").asInt(),
          action.get("outcome").asText(), today);
      default -> throw new IllegalArgumentException("Ação desconhecida: " + type);
    };
  }

  private Result applyMoveCard(BoardSimState state, String cardId, String to, LocalDate today) {
    SimCard card = state.cards.stream().filter(c -> c.id.equals(cardId)).findFirst().orElse(null);
    if (card == null || card.column.equals(to)) {
      return new Result(state, NO_EVENTS);
    }

    String previousColumn = card.column;
    boolean wasDone = previousColumn.equals("done");
    boolean willBeDone = to.equals("done");
    List<SimCard> newCards = state.cards.stream()
        .map(c -> c.id.equals(cardId) ? new SimCard(c.id, to, c.priority) : c)
        .toList();

    List<XpEventSim> events = new ArrayList<>();
    LedgerStats stats = state.stats;

    if (!wasDone && willBeDone) {
      XpEventSim event = new XpEventSim("card_done", engine.cardXp(card.priority), card.id);
      events.add(event);
      stats = applyEvent(stats, event, today);

      boolean clearedToday = previousColumn.equals("today")
          && newCards.stream().noneMatch(c -> c.column.equals("today"));
      if (clearedToday && !today.equals(stats.cleanDayPaid)) {
        XpEventSim cleanEvent = new XpEventSim("clean_day", engine.cleanDayXp(), null);
        events.add(cleanEvent);
        LedgerStats afterClean = applyEvent(stats, cleanEvent, today);
        stats = new LedgerStats(afterClean.rawTotal, afterClean.streak, afterClean.lastXpDay, today,
            afterClean.dayXp, afterClean.dayDone);
      }
    } else if (wasDone && !willBeDone) {
      XpEventSim event = new XpEventSim("card_undone", -engine.cardXp(card.priority), card.id);
      events.add(event);
      stats = applyEvent(stats, event, today);
    }

    return new Result(new BoardSimState(newCards, state.goals, state.subtasks, stats), events);
  }

  private Result applyToggleGoal(BoardSimState state, String goalId, boolean done, LocalDate today) {
    SimGoal goal = state.goals.stream().filter(g -> g.id.equals(goalId)).findFirst().orElse(null);
    if (goal == null || goal.done == done) {
      return new Result(state, NO_EVENTS);
    }

    List<SimGoal> newGoals = state.goals.stream()
        .map(g -> g.id.equals(goalId) ? new SimGoal(g.id, g.scope, done) : g)
        .toList();
    int magnitude = engine.goalXp(goal.scope);
    XpEventSim event = new XpEventSim(done ? "goal_done" : "goal_undone", done ? magnitude : -magnitude, goal.id);
    LedgerStats stats = applyEvent(state.stats, event, today);
    return new Result(new BoardSimState(state.cards, newGoals, state.subtasks, stats), List.of(event));
  }

  private Result applyToggleSubtask(BoardSimState state, String subtaskId, boolean done, LocalDate today) {
    SimSubtask subtask = state.subtasks.stream().filter(s -> s.id.equals(subtaskId)).findFirst().orElse(null);
    if (subtask == null || subtask.done == done) {
      return new Result(state, NO_EVENTS);
    }

    List<SimSubtask> newSubtasks = state.subtasks.stream()
        .map(s -> s.id.equals(subtaskId) ? new SimSubtask(s.id, s.cardId, done) : s)
        .toList();

    if (!done) {
      return new Result(new BoardSimState(state.cards, state.goals, newSubtasks, state.stats), NO_EVENTS);
    }

    XpEventSim event = new XpEventSim("subtask_done", engine.subtaskXp(), subtask.id);
    LedgerStats stats = applyEvent(state.stats, event, today);
    return new Result(new BoardSimState(state.cards, state.goals, newSubtasks, stats), List.of(event));
  }

  private Result applyFinishFocus(BoardSimState state, String cardId, int plannedMinutes, int elapsedMinutes,
      String outcome, LocalDate today) {
    if (!outcome.equals("completed")) {
      return new Result(state, NO_EVENTS);
    }
    XpEventSim event = new XpEventSim("focus_session", engine.focusXp(plannedMinutes, elapsedMinutes), cardId);
    LedgerStats stats = applyEvent(state.stats, event, today);
    return new Result(new BoardSimState(state.cards, state.goals, state.subtasks, stats), List.of(event));
  }

  private LedgerStats applyEvent(LedgerStats stats, XpEventSim event, LocalDate today) {
    int dayDoneDelta = switch (event.reason) {
      case "card_done", "goal_done" -> 1;
      case "card_undone", "goal_undone" -> -1;
      default -> 0;
    };

    int streak = stats.streak;
    LocalDate lastXpDay = stats.lastXpDay;
    if (event.delta > 0 && !today.equals(lastXpDay)) {
      streak = engine.isYesterday(lastXpDay, today) ? streak + 1 : 1;
      lastXpDay = today;
    }

    return new LedgerStats(stats.rawTotal + event.delta, streak, lastXpDay, stats.cleanDayPaid,
        stats.dayXp + event.delta, stats.dayDone + dayDoneDelta);
  }

  private DisplayStats projectDisplayStats(LedgerStats stats, LocalDate today) {
    int xpTotal = Math.max(0, stats.rawTotal);
    XpRuleEngine.LevelInfo levelInfo = engine.getLevelInfo(xpTotal);
    int streak = engine.isStreakAlive(stats.lastXpDay, today) ? stats.streak : 0;
    return new DisplayStats(stats.rawTotal, xpTotal, levelInfo.level(), levelInfo.rank(), levelInfo.xpIntoLevel(),
        levelInfo.xpForNextLevel(), streak, stats.dayXp, stats.dayDone);
  }
}
