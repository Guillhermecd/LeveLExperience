package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.request.CreateCalendarEventRequest;
import br.com.oaksd.kanban.dto.request.UpdateCalendarEventRequest;
import br.com.oaksd.kanban.dto.response.CalendarEventResponse;
import br.com.oaksd.kanban.entity.CalendarEvent;
import br.com.oaksd.kanban.exception.BusinessException;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.mapper.CalendarEventMapper;
import br.com.oaksd.kanban.repository.CalendarEventRepository;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Agenda do usuário. Deliberately outside the XP model: no XpService here and
 * no row in xp_events — creating an appointment is not an achievement, and
 * wiring XP in would let a user farm points by typing events (PLAN.md).
 */
@Service
public class CalendarEventService {

  private final CalendarEventRepository calendarEventRepository;
  private final CalendarEventMapper calendarEventMapper;

  public CalendarEventService(CalendarEventRepository calendarEventRepository,
      CalendarEventMapper calendarEventMapper) {
    this.calendarEventRepository = calendarEventRepository;
    this.calendarEventMapper = calendarEventMapper;
  }

  /**
   * Lists the user's events. With {@code from}/{@code to} the query is bounded
   * by the visible month; without them it falls back to the full agenda, so a
   * caller that cannot compute a range still gets a coherent, sorted list.
   *
   * <p>The range is an instant range, not a local-date one: the browser sends
   * the month boundaries already converted to UTC.
   */
  @Transactional(readOnly = true)
  public List<CalendarEventResponse> list(UUID userId, Instant from, Instant to) {
    List<CalendarEvent> events = (from == null || to == null)
        ? calendarEventRepository.findByUserIdOrderByStartsAtAsc(userId)
        : calendarEventRepository.findByUserIdAndStartsAtBetweenOrderByStartsAtAsc(userId, from, to);
    return calendarEventMapper.toResponseList(events);
  }

  /**
   * Creates an event with a client-generated id. Resending the same id is
   * idempotent (the stored event comes back untouched); the same id under
   * another owner is a collision, not an overwrite.
   */
  @Transactional
  public CalendarEventResponse create(UUID userId, CreateCalendarEventRequest request) {
    requireCoherentInterval(request.startsAt(), request.endsAt());

    // Bare findById is intentional (see CardService.create): it must see an
    // event owned by ANY user to catch a global client-generated id collision.
    CalendarEvent existing = calendarEventRepository.findById(request.id()).orElse(null);
    if (existing != null) {
      if (!existing.getUserId().equals(userId)) {
        throw new ConflictException("Este identificador de compromisso já está em uso.");
      }
      return calendarEventMapper.toResponse(existing);
    }

    CalendarEvent event = new CalendarEvent();
    event.setId(request.id());
    event.setUserId(userId);
    event.setTitle(request.title());
    event.setDescription(request.description());
    event.setStartsAt(request.startsAt());
    event.setEndsAt(request.endsAt());
    event.setColor(request.color());
    calendarEventRepository.save(event);
    return calendarEventMapper.toResponse(event);
  }

  /** Replaces the editable fields of an event the caller owns. */
  @Transactional
  public CalendarEventResponse update(UUID userId, UUID eventId, UpdateCalendarEventRequest request) {
    requireCoherentInterval(request.startsAt(), request.endsAt());

    // 404 and never 403 (decision #5): a 403 would confirm that the id exists
    // under someone else's account.
    CalendarEvent event = calendarEventRepository.findByIdAndUserId(eventId, userId)
        .orElseThrow(() -> new NotFoundException("Compromisso não encontrado."));
    event.setTitle(request.title());
    event.setDescription(request.description());
    event.setStartsAt(request.startsAt());
    event.setEndsAt(request.endsAt());
    event.setColor(request.color());
    calendarEventRepository.save(event);
    return calendarEventMapper.toResponse(event);
  }

  /** Deletes an event the caller owns. */
  @Transactional
  public void delete(UUID userId, UUID eventId) {
    CalendarEvent event = calendarEventRepository.findByIdAndUserId(eventId, userId)
        .orElseThrow(() -> new NotFoundException("Compromisso não encontrado."));
    calendarEventRepository.delete(event);
  }

  // Mirrors the calendar_events_end_after_start CHECK. Validated here too so
  // the user gets a readable 400 instead of a constraint violation at flush.
  private void requireCoherentInterval(Instant startsAt, Instant endsAt) {
    if (endsAt != null && endsAt.isBefore(startsAt)) {
      throw new BusinessException(HttpStatus.BAD_REQUEST, "O término não pode ser antes do início.");
    }
  }
}
