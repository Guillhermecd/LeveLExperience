package br.com.oaksd.kanban.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import br.com.oaksd.kanban.dto.request.FinishFocusRequest;
import br.com.oaksd.kanban.dto.request.MoveCardRequest;
import br.com.oaksd.kanban.dto.request.StartFocusRequest;
import br.com.oaksd.kanban.dto.request.ToggleGoalRequest;
import br.com.oaksd.kanban.dto.request.ToggleSubtaskRequest;
import br.com.oaksd.kanban.entity.Card;
import br.com.oaksd.kanban.entity.FocusSession;
import br.com.oaksd.kanban.entity.Goal;
import br.com.oaksd.kanban.entity.Subtask;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.entity.UserStats;
import br.com.oaksd.kanban.entity.XpEvent;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.repository.CardRepository;
import br.com.oaksd.kanban.repository.FocusSessionRepository;
import br.com.oaksd.kanban.repository.GoalRepository;
import br.com.oaksd.kanban.repository.SubtaskRepository;
import br.com.oaksd.kanban.repository.UserRepository;
import br.com.oaksd.kanban.repository.UserStatsRepository;
import br.com.oaksd.kanban.repository.XpEventRepository;
import br.com.oaksd.kanban.service.CardService;
import br.com.oaksd.kanban.service.FocusService;
import br.com.oaksd.kanban.service.GoalService;
import br.com.oaksd.kanban.service.MeService;
import br.com.oaksd.kanban.service.SubtaskService;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * GATES.md "Fase 3 — Backend": everything that only breaks against a real Postgres — the
 * unique-constraint idempotency, the ownership 404, the CASCADE, the one-active-session index,
 * the timezone-aware day. One shared container for the whole class (start cost is per-JVM, not
 * per-test); each test uses its own randomly-generated users so nothing needs cleaning between
 * them.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Testcontainers
class PhaseGatesIT {

  @Container
  static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
      .withDatabaseName("kanban")
      .withUsername("kanban")
      .withPassword("kanban");

  @DynamicPropertySource
  static void datasourceProperties(DynamicPropertyRegistry registry) {
    registry.add("spring.datasource.url", postgres::getJdbcUrl);
    registry.add("spring.datasource.username", postgres::getUsername);
    registry.add("spring.datasource.password", postgres::getPassword);
    registry.add("app.jwt.secret", () -> "integration-test-secret-key-at-least-32-bytes-long");
    registry.add("app.email.enabled", () -> "false");
  }

  @Autowired private UserRepository userRepository;
  @Autowired private UserStatsRepository userStatsRepository;
  @Autowired private CardRepository cardRepository;
  @Autowired private SubtaskRepository subtaskRepository;
  @Autowired private GoalRepository goalRepository;
  @Autowired private XpEventRepository xpEventRepository;
  @Autowired private FocusSessionRepository focusSessionRepository;
  @Autowired private CardService cardService;
  @Autowired private GoalService goalService;
  @Autowired private SubtaskService subtaskService;
  @Autowired private FocusService focusService;
  @Autowired private MeService meService;

  private UUID createUser(String timezone) {
    User user = new User();
    user.setEmail(UUID.randomUUID() + "@phasegates.test");
    user.setPasswordHash("not-used-here");
    user.setTimezone(timezone);
    userRepository.save(user);
    UserStats stats = new UserStats();
    stats.setUserId(user.getId());
    userStatsRepository.save(stats);
    return user.getId();
  }

  private UUID createCard(UUID userId, String column, short priority) {
    Card card = new Card();
    card.setId(UUID.randomUUID());
    card.setUserId(userId);
    card.setColumnKey(column);
    card.setTitle("Card de teste");
    card.setPriority(priority);
    card.setPosition(1024.0);
    cardRepository.save(card);
    return card.getId();
  }

  @Nested
  class Idempotencia {

    // Gate 3.2: ten concurrent requests with the SAME Idempotency-Key must
    // settle the card_done XP exactly once — the unique index decides, not
    // an in-code check racing itself.
    @Test
    void tenConcurrentMovesWithTheSameKeySettleXpOnce() throws Exception {
      UUID userId = createUser("America/Sao_Paulo");
      UUID cardId = createCard(userId, "doing", (short) 2); // 30 XP
      String idempotencyKey = "concurrent-move-1";
      int threads = 10;

      ExecutorService pool = Executors.newFixedThreadPool(threads);
      CountDownLatch ready = new CountDownLatch(threads);
      CountDownLatch go = new CountDownLatch(1);

      List<? extends Future<?>> futures = IntStream.range(0, threads)
          .mapToObj(i -> pool.submit(() -> {
            ready.countDown();
            awaitUninterruptibly(go);
            try {
              cardService.move(userId, cardId, new MoveCardRequest("done", null), idempotencyKey);
            } catch (RuntimeException raced) {
              // A concurrent request may observe the card already in "done"
              // (its own no-op branch) — not the property under test.
            }
          }))
          .toList();

      ready.await();
      go.countDown();
      for (Future<?> future : futures) {
        future.get(15, TimeUnit.SECONDS);
      }
      pool.shutdown();

      long cardDoneEvents = xpEventRepository.findByUserIdOrderByDayAsc(userId).stream()
          .filter(e -> "card_done".equals(e.getReason()))
          .count();
      assertThat(cardDoneEvents).isEqualTo(1);

      UserStats stats = userStatsRepository.findById(userId).orElseThrow();
      assertThat(stats.getXpTotal()).isEqualTo(30);
    }

    private void awaitUninterruptibly(CountDownLatch latch) {
      try {
        latch.await();
      } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
        throw new RuntimeException(e);
      }
    }
  }

  @Nested
  class Isolamento {

    // Gate 3.3: someone else's card 404s exactly like it doesn't exist.
    @Test
    void movingAnotherUsersCard_throwsNotFound() {
      UUID owner = createUser("America/Sao_Paulo");
      UUID intruder = createUser("America/Sao_Paulo");
      UUID cardId = createCard(owner, "doing", (short) 0);

      assertThatThrownBy(() -> cardService.move(intruder, cardId, new MoveCardRequest("done", null), "key"))
          .isInstanceOf(NotFoundException.class);
    }

    // Gate 3.4: deleting the account leaves no orphan in any child table —
    // ON DELETE CASCADE, not application-level cleanup.
    @Test
    void deletingTheAccount_cascadesToEveryChildTable() {
      UUID userId = createUser("America/Sao_Paulo");
      UUID cardId = createCard(userId, "today", (short) 1);
      Subtask subtask = new Subtask();
      subtask.setId(UUID.randomUUID());
      subtask.setCardId(cardId);
      subtask.setTitle("Sub");
      subtask.setPosition(1024.0);
      subtaskRepository.save(subtask);

      Goal goal = new Goal();
      goal.setId(UUID.randomUUID());
      goal.setUserId(userId);
      goal.setScope("week");
      goal.setTitle("Meta");
      goal.setPosition(1024.0);
      goalRepository.save(goal);

      cardService.move(userId, cardId, new MoveCardRequest("done", null), "cascade-key");
      focusService.start(userId, new StartFocusRequest(cardId, 25));

      meService.deleteAccount(userId);

      assertThat(userRepository.findById(userId)).isEmpty();
      assertThat(userStatsRepository.findById(userId)).isEmpty();
      assertThat(cardRepository.findByUserIdOrderByColumnKeyAscPositionAsc(userId)).isEmpty();
      assertThat(subtaskRepository.findByCardIdOrderByPositionAsc(cardId)).isEmpty();
      assertThat(goalRepository.findByUserIdOrderByScopeAscPositionAsc(userId)).isEmpty();
      assertThat(xpEventRepository.findByUserIdOrderByDayAsc(userId)).isEmpty();
      assertThat(focusSessionRepository.findByUserIdOrderByStartedAtAsc(userId)).isEmpty();
    }
  }

  @Nested
  class Ordenacao {

    // Gate 3.5 (partial — see report): a move only ever writes the moved
    // card's own row. Free repositioning within a column (afterId,
    // rebalancing) is not implemented yet, so it is not asserted here.
    @Test
    void movingOneCard_leavesEveryOtherCardsPositionUntouched() {
      UUID userId = createUser("America/Sao_Paulo");
      UUID moving = createCard(userId, "today", (short) 0);
      UUID other1 = createCard(userId, "today", (short) 1);
      UUID other2 = createCard(userId, "doing", (short) 2);
      double other1Position = cardRepository.findById(other1).orElseThrow().getPosition();
      double other2Position = cardRepository.findById(other2).orElseThrow().getPosition();

      cardService.move(userId, moving, new MoveCardRequest("doing", null), "reorder-key");

      assertThat(cardRepository.findById(other1).orElseThrow().getPosition()).isEqualTo(other1Position);
      assertThat(cardRepository.findById(other2).orElseThrow().getPosition()).isEqualTo(other2Position);
      assertThat(cardRepository.findById(moving).orElseThrow().getColumnKey()).isEqualTo("doing");
    }
  }

  @Nested
  class Foco {

    // Gate 3.6: the DB's partial unique index rejects a second active
    // session, not a pre-check the caller could race.
    @Test
    void startingASecondSessionWhileOneIsActive_throwsConflict() {
      UUID userId = createUser("America/Sao_Paulo");
      UUID card1 = createCard(userId, "doing", (short) 0);
      UUID card2 = createCard(userId, "doing", (short) 1);

      focusService.start(userId, new StartFocusRequest(card1, 25));

      assertThatThrownBy(() -> focusService.start(userId, new StartFocusRequest(card2, 25)))
          .isInstanceOf(ConflictException.class);
    }

    // Gate 3.7: XP comes from started_at, never from a client-sent duration
    // (the API doesn't even accept one) — back-date started_at to simulate
    // server-measured elapsed time.
    @Test
    void finishingASession_settlesXpFromTheServerElapsedTime() {
      UUID userId = createUser("America/Sao_Paulo");
      UUID cardId = createCard(userId, "doing", (short) 0);

      var session = focusService.start(userId, new StartFocusRequest(cardId, 25));
      FocusSession stored = focusSessionRepository.findByIdAndUserId(session.id(), userId).orElseThrow();
      stored.setStartedAt(Instant.now().minusSeconds(18 * 60L));
      focusSessionRepository.save(stored);

      focusService.finish(userId, session.id(), new FinishFocusRequest("completed"), "finish-key");

      List<XpEvent> focusEvents = xpEventRepository.findByUserIdOrderByDayAsc(userId).stream()
          .filter(e -> "focus_session".equals(e.getReason()))
          .toList();
      assertThat(focusEvents).hasSize(1);
      assertThat(focusEvents.get(0).getDelta()).isEqualTo(18);
    }
  }

  @Nested
  class Ledger {

    // Gate 3.8: user_stats.xp_total always equals the clamped SUM(delta) of
    // the events actually recorded — recomputed, never incremented in place.
    @Test
    void userStatsXpTotal_matchesTheClampedSumOfTheLedger() {
      UUID userId = createUser("America/Sao_Paulo");
      UUID card1 = createCard(userId, "doing", (short) 2); // 30
      UUID card2 = createCard(userId, "doing", (short) 0); // 10
      Goal goal = new Goal();
      goal.setId(UUID.randomUUID());
      goal.setUserId(userId);
      goal.setScope("week");
      goal.setTitle("Meta");
      goal.setPosition(1024.0);
      goalRepository.save(goal);

      cardService.move(userId, card1, new MoveCardRequest("done", null), "k1");
      cardService.move(userId, card2, new MoveCardRequest("done", null), "k2");
      goalService.toggle(userId, goal.getId(), new ToggleGoalRequest(true), "k3");
      cardService.move(userId, card1, new MoveCardRequest("today", null), "k4"); // reverses card1: -30

      int sumFromLedger = xpEventRepository.findByUserIdOrderByDayAsc(userId).stream()
          .mapToInt(XpEvent::getDelta)
          .sum();
      UserStats stats = userStatsRepository.findById(userId).orElseThrow();

      assertThat(sumFromLedger).isEqualTo(10 + 60); // card2 (10) + goal (60); card1 nets to 0
      assertThat(stats.getXpTotal()).isEqualTo(Math.max(0, sumFromLedger));
    }

    // Gate 3.9: card_done and its clean-day bonus are two events in one
    // @Transactional move — both land, or (on an aborted transaction)
    // neither would. Exercised here as the observable pair, not via fault
    // injection: the settlement code path has no network call between the
    // two xpService.settle() calls, which is what keeps them atomic.
    @Test
    void clearingTheLastCardInToday_settlesBothCardDoneAndCleanDayTogether() {
      UUID userId = createUser("America/Sao_Paulo");
      UUID onlyCardInToday = createCard(userId, "today", (short) 0);

      cardService.move(userId, onlyCardInToday, new MoveCardRequest("done", null), "atomic-key");

      List<String> reasons = xpEventRepository.findByUserIdOrderByDayAsc(userId).stream()
          .map(XpEvent::getReason)
          .toList();
      assertThat(reasons).containsExactlyInAnyOrder("card_done", "clean_day");

      UserStats stats = userStatsRepository.findById(userId).orElseThrow();
      assertThat(stats.getXpTotal()).isEqualTo(10 + 50);
    }

    // Gate 3.10: the event's day is the user's local day, not UTC.
    @Test
    void xpEventDay_usesTheUsersTimezoneNotUtc() {
      UUID userId = createUser("Pacific/Kiritimati"); // UTC+14, always ahead of UTC's date
      UUID cardId = createCard(userId, "doing", (short) 0);

      cardService.move(userId, cardId, new MoveCardRequest("done", null), "tz-key");

      XpEvent event = xpEventRepository.findByUserIdOrderByDayAsc(userId).get(0);
      LocalDate expected = LocalDate.now(ZoneId.of("Pacific/Kiritimati"));
      assertThat(event.getDay()).isEqualTo(expected);
    }
  }
}
