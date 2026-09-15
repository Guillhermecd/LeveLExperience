package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.request.CreateCalendarEventRequest;
import br.com.oaksd.kanban.dto.request.UpdateCalendarEventRequest;
import br.com.oaksd.kanban.dto.response.CalendarEventResponse;
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

  private static CalendarEvent storedEvent(UUID id, UUID userId) {
    CalendarEvent event = new CalendarEvent();
    event.setId(id);
    event.setUserId(userId);
    event.setTitle("Consulta");
    event.setDescription("Levar exames");
    event.setStartsAt(START);
    event.setEndsAt(END);
    event.setColor("lime");
    return event;
  }

  private static CalendarEventResponse responseOf(UUID id) {
    return new CalendarEventResponse(id, "Consulta", "Levar exames", START, END, "lime");
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
  // --- create: boundaries of the interval rule ---------------------------

  @Test
  void create_withoutEnd_isAccepted() {
    UUID userId = UUID.randomUUID();
    CreateCalendarEventRequest request = createRequest(UUID.randomUUID(), START, null);
    when(calendarEventRepository.findById(request.id())).thenReturn(Optional.empty());

    calendarEventService.create(userId, request);

    ArgumentCaptor<CalendarEvent> captor = ArgumentCaptor.forClass(CalendarEvent.class);
    verify(calendarEventRepository).save(captor.capture());
    assertThat(captor.getValue().getEndsAt()).isNull();
  }

  // The DB CHECK is `ends_at >= starts_at`, so a zero-length appointment is
  // legal. Guards against someone "tightening" the service to reject equality
  // and diverging from calendar_events_end_after_start.
  @Test
  void create_withEndEqualToStart_isAccepted() {
    UUID userId = UUID.randomUUID();
    CreateCalendarEventRequest request = createRequest(UUID.randomUUID(), START, START);
    when(calendarEventRepository.findById(request.id())).thenReturn(Optional.empty());

    calendarEventService.create(userId, request);

    verify(calendarEventRepository).save(any());
  }

  @Test
  void create_withEndOneMilliBeforeStart_isRejected() {
    UUID userId = UUID.randomUUID();
    CreateCalendarEventRequest request =
        createRequest(UUID.randomUUID(), START, START.minusMillis(1));

    assertThatThrownBy(() -> calendarEventService.create(userId, request))
        .isInstanceOf(BusinessException.class);
    verify(calendarEventRepository, never()).findById(any());
  }

  // The replay contract: the id wins, the payload does not. A second POST with
  // the same id and a different body must NOT silently become an update.
  @Test
  void create_replayWithChangedPayload_returnsTheStoredEventUntouched() {
    UUID userId = UUID.randomUUID();
    UUID eventId = UUID.randomUUID();
    CalendarEvent stored = storedEvent(eventId, userId);
    CreateCalendarEventRequest replay =
        new CreateCalendarEventRequest(eventId, "Outro titulo", "Outra nota", START, END, "coral");
    when(calendarEventRepository.findById(eventId)).thenReturn(Optional.of(stored));
    when(calendarEventMapper.toResponse(stored)).thenReturn(responseOf(eventId));

    CalendarEventResponse response = calendarEventService.create(userId, replay);

    assertThat(response.title()).isEqualTo("Consulta");
    assertThat(stored.getTitle()).isEqualTo("Consulta");
    assertThat(stored.getColor()).isEqualTo("lime");
    verify(calendarEventRepository, never()).save(any());
  }

  // --- update ------------------------------------------------------------

  @Test
  void update_replacesEveryEditableField() {
    UUID userId = UUID.randomUUID();
    UUID eventId = UUID.randomUUID();
    CalendarEvent stored = storedEvent(eventId, userId);
    Instant newStart = START.plusSeconds(3600);
    UpdateCalendarEventRequest request =
        new UpdateCalendarEventRequest("Dentista", null, newStart, null, "violet");
    when(calendarEventRepository.findByIdAndUserId(eventId, userId)).thenReturn(Optional.of(stored));

    calendarEventService.update(userId, eventId, request);

    ArgumentCaptor<CalendarEvent> captor = ArgumentCaptor.forClass(CalendarEvent.class);
    verify(calendarEventRepository).save(captor.capture());
    CalendarEvent saved = captor.getValue();
    assertThat(saved.getTitle()).isEqualTo("Dentista");
    // Total replacement (see UpdateCalendarEventRequest): an omitted field is
    // cleared, it does not keep the previous value.
    assertThat(saved.getDescription()).isNull();
    assertThat(saved.getEndsAt()).isNull();
    assertThat(saved.getStartsAt()).isEqualTo(newStart);
    assertThat(saved.getColor()).isEqualTo("violet");
    assertThat(saved.getUserId()).isEqualTo(userId);
    assertThat(saved.getId()).isEqualTo(eventId);
  }

  @Test
  void update_withEndBeforeStart_isRejectedBeforeReadingTheEvent() {
    UUID userId = UUID.randomUUID();
    UUID eventId = UUID.randomUUID();
    UpdateCalendarEventRequest request =
        new UpdateCalendarEventRequest("Consulta", null, END, START, "lime");

    assertThatThrownBy(() -> calendarEventService.update(userId, eventId, request))
        .isInstanceOf(BusinessException.class)
        .hasMessageContaining("término");
    verify(calendarEventRepository, never()).findByIdAndUserId(any(), any());
    verify(calendarEventRepository, never()).save(any());
  }

  // --- delete ------------------------------------------------------------

  @Test
  void delete_ofOwnEvent_removesTheStoredEvent() {
    UUID userId = UUID.randomUUID();
    UUID eventId = UUID.randomUUID();
    CalendarEvent stored = storedEvent(eventId, userId);
    when(calendarEventRepository.findByIdAndUserId(eventId, userId)).thenReturn(Optional.of(stored));

    calendarEventService.delete(userId, eventId);

    verify(calendarEventRepository).delete(stored);
  }

  // Deleting twice must stay a 404, not turn into a silent success: the second
  // call is what a double-click on the trash icon produces.
  @Test
  void delete_twice_keepsReturningNotFound() {
    UUID userId = UUID.randomUUID();
    UUID eventId = UUID.randomUUID();
    CalendarEvent stored = storedEvent(eventId, userId);
    when(calendarEventRepository.findByIdAndUserId(eventId, userId))
        .thenReturn(Optional.of(stored))
        .thenReturn(Optional.empty());

    calendarEventService.delete(userId, eventId);

    assertThatThrownBy(() -> calendarEventService.delete(userId, eventId))
        .isInstanceOf(NotFoundException.class);
    verify(calendarEventRepository).delete(stored);
  }

  // --- list --------------------------------------------------------------

  @Test
  void list_withoutRange_fallsBackToTheFullAgenda() {
    UUID userId = UUID.randomUUID();
    when(calendarEventRepository.findByUserIdOrderByStartsAtAsc(userId)).thenReturn(List.of());

    calendarEventService.list(userId, null, null);

    verify(calendarEventRepository).findByUserIdOrderByStartsAtAsc(userId);
    verify(calendarEventRepository, never())
        .findByUserIdAndStartsAtBetweenOrderByStartsAtAsc(any(), any(), any());
  }

  // A half-filled range is not a range: a caller that sends only `from` gets
  // the whole agenda rather than an unbounded query with a null parameter.
  @Test
  void list_withOnlyOneBound_fallsBackToTheFullAgenda() {
    UUID userId = UUID.randomUUID();
    when(calendarEventRepository.findByUserIdOrderByStartsAtAsc(userId)).thenReturn(List.of());

    calendarEventService.list(userId, START, null);
    calendarEventService.list(userId, null, END);

    verify(calendarEventRepository, org.mockito.Mockito.times(2))
        .findByUserIdOrderByStartsAtAsc(userId);
    verify(calendarEventRepository, never())
        .findByUserIdAndStartsAtBetweenOrderByStartsAtAsc(any(), any(), any());
  }

  @Test
  void list_withNoEvents_returnsEmptyListAndNotNull() {
    UUID userId = UUID.randomUUID();
    when(calendarEventRepository.findByUserIdOrderByStartsAtAsc(userId)).thenReturn(List.of());
    when(calendarEventMapper.toResponseList(List.of())).thenReturn(List.of());

    assertThat(calendarEventService.list(userId, null, null)).isEmpty();
  }

  @Test
  void list_returnsTheMappedResponsesInRepositoryOrder() {
    UUID userId = UUID.randomUUID();
    UUID firstId = UUID.randomUUID();
    UUID secondId = UUID.randomUUID();
    List<CalendarEvent> stored =
        List.of(storedEvent(firstId, userId), storedEvent(secondId, userId));
    when(calendarEventRepository.findByUserIdOrderByStartsAtAsc(userId)).thenReturn(stored);
    when(calendarEventMapper.toResponseList(stored))
        .thenReturn(List.of(responseOf(firstId), responseOf(secondId)));

    assertThat(calendarEventService.list(userId, null, null))
        .extracting(CalendarEventResponse::id)
        .containsExactly(firstId, secondId);
  }

  @Test
  void create_doesNotSettleXp() {
    assertThat(Arrays.stream(CalendarEventService.class.getDeclaredFields()).map(Field::getType))
        .noneMatch(type -> type.getSimpleName().contains("Xp"));
  }
}
