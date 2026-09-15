package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.request.CreateCalendarEventRequest;
import br.com.oaksd.kanban.dto.request.UpdateCalendarEventRequest;
import br.com.oaksd.kanban.entity.CalendarEvent;
import br.com.oaksd.kanban.exception.BusinessException;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.CalendarEventMapper;
import br.com.oaksd.kanban.repository.CalendarEventRepository;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CalendarEventServiceTest {

  private static final Instant START = Instant.parse("2026-09-15T13:00:00Z");
  private static final Instant END = Instant.parse("2026-09-15T14:00:00Z");

  @Mock private CalendarEventRepository calendarEventRepository;
  @Mock private CalendarEventMapper calendarEventMapper;

  private CalendarEventService calendarEventService;

  @BeforeEach
  void setUp() {
    calendarEventService = new CalendarEventService(calendarEventRepository, calendarEventMapper);
  }

  private static CreateCalendarEventRequest createRequest(UUID id, Instant startsAt, Instant endsAt) {
    return new CreateCalendarEventRequest(id, "Consulta", "Levar exames", startsAt, endsAt, "lime");
  }

  @Test
  void create_withUnseenId_persistsTheEvent() {
    UUID userId = UUID.randomUUID();
    CreateCalendarEventRequest request = createRequest(UUID.randomUUID(), START, END);
    when(calendarEventRepository.findById(request.id())).thenReturn(Optional.empty());

    calendarEventService.create(userId, request);

    ArgumentCaptor<CalendarEvent> captor = ArgumentCaptor.forClass(CalendarEvent.class);
    verify(calendarEventRepository).save(captor.capture());
    CalendarEvent saved = captor.getValue();
    assertThat(saved.getId()).isEqualTo(request.id());
    assertThat(saved.getUserId()).isEqualTo(userId);
    assertThat(saved.getTitle()).isEqualTo("Consulta");
    assertThat(saved.getStartsAt()).isEqualTo(START);
    assertThat(saved.getEndsAt()).isEqualTo(END);
    assertThat(saved.getColor()).isEqualTo("lime");
  }

  @Test
  void create_withIdAlreadyOwnedByCaller_isIdempotentAndDoesNotSaveAgain() {
    UUID userId = UUID.randomUUID();
    CreateCalendarEventRequest request = createRequest(UUID.randomUUID(), START, END);
    CalendarEvent existing = new CalendarEvent();
    existing.setId(request.id());
    existing.setUserId(userId);
    when(calendarEventRepository.findById(request.id())).thenReturn(Optional.of(existing));

    calendarEventService.create(userId, request);

    verify(calendarEventRepository, never()).save(any());
  }

  @Test
  void create_withIdOwnedByAnotherUser_throwsConflict() {
    UUID userId = UUID.randomUUID();
    CreateCalendarEventRequest request = createRequest(UUID.randomUUID(), START, END);
    CalendarEvent existing = new CalendarEvent();
    existing.setId(request.id());
    existing.setUserId(UUID.randomUUID());
    when(calendarEventRepository.findById(request.id())).thenReturn(Optional.of(existing));

    assertThatThrownBy(() -> calendarEventService.create(userId, request)).isInstanceOf(ConflictException.class);
  }

  @Test
  void create_withEndBeforeStart_isRejected() {
    UUID userId = UUID.randomUUID();
    CreateCalendarEventRequest request = createRequest(UUID.randomUUID(), END, START);

    assertThatThrownBy(() -> calendarEventService.create(userId, request))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("término");
    verify(calendarEventRepository, never()).save(any());
  }

  @Test
  void update_ofAnotherUsersEvent_throwsNotFound() {
    UUID userId = UUID.randomUUID();
    UUID eventId = UUID.randomUUID();
    UpdateCalendarEventRequest request =
        new UpdateCalendarEventRequest("Consulta", null, START, END, "lime");
    when(calendarEventRepository.findByIdAndUserId(eventId, userId)).thenReturn(Optional.empty());

    // 404, never 403: a 403 would confirm the event exists under another owner.
    assertThatThrownBy(() -> calendarEventService.update(userId, eventId, request))
        .isInstanceOf(NotFoundException.class);
  }

  @Test
  void delete_ofAnotherUsersEvent_throwsNotFound() {
    UUID userId = UUID.randomUUID();
    UUID eventId = UUID.randomUUID();
    when(calendarEventRepository.findByIdAndUserId(eventId, userId)).thenReturn(Optional.empty());

    assertThatThrownBy(() -> calendarEventService.delete(userId, eventId)).isInstanceOf(NotFoundException.class);
  }

  @Test
  void list_withRange_queriesTheBoundedFinder() {
    UUID userId = UUID.randomUUID();
    Instant from = Instant.parse("2026-09-01T03:00:00Z");
    Instant to = Instant.parse("2026-10-01T02:59:59Z");
    when(calendarEventRepository.findByUserIdAndStartsAtBetweenOrderByStartsAtAsc(userId, from, to))
        .thenReturn(List.of());

    calendarEventService.list(userId, from, to);

    verify(calendarEventRepository).findByUserIdAndStartsAtBetweenOrderByStartsAtAsc(userId, from, to);
    verify(calendarEventRepository, never()).findByUserIdOrderByStartsAtAsc(any());
  }

  // The "no XP for calendar events" decision is structural, not behavioural:
  // the service has no XpService field at all, so there is no mock to verify
  // against. Asserting on the declared fields is what actually fails the day
  // someone wires XP in — a verifyNoInteractions on an injected mock could
  // not exist without first breaking the decision it is meant to protect.
  @Test
  void create_doesNotSettleXp() {
    assertThat(Arrays.stream(CalendarEventService.class.getDeclaredFields()).map(Field::getType))
        .noneMatch(type -> type.getSimpleName().contains("Xp"));
  }
}
