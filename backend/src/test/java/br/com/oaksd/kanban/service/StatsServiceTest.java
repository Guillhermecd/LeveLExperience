package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.response.StatsResponse;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.entity.UserStats;
import br.com.oaksd.kanban.entity.XpEvent;
import br.com.oaksd.kanban.repository.UserRepository;
import br.com.oaksd.kanban.repository.UserStatsRepository;
import br.com.oaksd.kanban.repository.XpEventRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private UserStatsRepository userStatsRepository;
  @Mock private XpEventRepository xpEventRepository;

  private StatsService statsService;

  @BeforeEach
  void setUp() {
    statsService = new StatsService(userRepository, userStatsRepository, xpEventRepository, new XpRuleEngine());
  }

  @Test
  void getStats_derivesLevelAndTodayFromTheLedger_neverFromStoredTotals() {
    UUID userId = UUID.randomUUID();
    User user = new User();
    user.setTimezone("America/Sao_Paulo");
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    UserStats stats = new UserStats();
    stats.setUserId(userId);
    stats.setXpTotal(109);
    stats.setStreak(2);
    LocalDate today = LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo"));
    stats.setLastXpDay(today);
    when(userStatsRepository.findById(userId)).thenReturn(Optional.of(stats));

    XpEvent event = new XpEvent();
    event.setUserId(userId);
    event.setDay(today);
    event.setDelta(10);
    event.setReason("card_done");
    when(xpEventRepository.findByUserIdAndDayGreaterThanEqualOrderByDayAsc(org.mockito.ArgumentMatchers.eq(userId),
        org.mockito.ArgumentMatchers.any())).thenReturn(List.of(event));

    StatsResponse response = statsService.getStats(userId);

    assertThat(response.xpTotal()).isEqualTo(109);
    assertThat(response.level()).isEqualTo(2);
    assertThat(response.rank()).isEqualTo("Aprendiz");
    assertThat(response.streak()).isEqualTo(2);
    assertThat(response.dayXp()).isEqualTo(10);
    assertThat(response.dayDone()).isEqualTo(1);
    assertThat(response.history()).hasSize(14);
  }

  @Test
  void getStats_withStaleLastXpDay_showsStreakZero() {
    UUID userId = UUID.randomUUID();
    User user = new User();
    user.setTimezone("America/Sao_Paulo");
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    UserStats stats = new UserStats();
    stats.setUserId(userId);
    stats.setXpTotal(900);
    stats.setStreak(5);
    stats.setLastXpDay(LocalDate.now(java.time.ZoneId.of("America/Sao_Paulo")).minusDays(10));
    when(userStatsRepository.findById(userId)).thenReturn(Optional.of(stats));
    when(xpEventRepository.findByUserIdAndDayGreaterThanEqualOrderByDayAsc(org.mockito.ArgumentMatchers.eq(userId),
        org.mockito.ArgumentMatchers.any())).thenReturn(List.of());

    StatsResponse response = statsService.getStats(userId);

    assertThat(response.streak()).isZero();
  }
}
