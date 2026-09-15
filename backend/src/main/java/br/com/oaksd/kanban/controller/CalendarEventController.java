package br.com.oaksd.kanban.controller;

import br.com.oaksd.kanban.dto.request.CreateCalendarEventRequest;
import br.com.oaksd.kanban.dto.request.UpdateCalendarEventRequest;
import br.com.oaksd.kanban.dto.response.CalendarEventResponse;
import br.com.oaksd.kanban.security.CurrentUser;
import br.com.oaksd.kanban.service.CalendarEventService;
import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calendar-events")
public class CalendarEventController {

  private final CalendarEventService calendarEventService;

  public CalendarEventController(CalendarEventService calendarEventService) {
    this.calendarEventService = calendarEventService;
  }

  @GetMapping
  public List<CalendarEventResponse> list(@CurrentUser UUID userId,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant from,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant to) {
    return calendarEventService.list(userId, from, to);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public CalendarEventResponse create(@CurrentUser UUID userId,
      @Valid @RequestBody CreateCalendarEventRequest request) {
    return calendarEventService.create(userId, request);
  }

  @PatchMapping("/{id}")
  public CalendarEventResponse update(@CurrentUser UUID userId, @PathVariable UUID id,
      @Valid @RequestBody UpdateCalendarEventRequest request) {
    return calendarEventService.update(userId, id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@CurrentUser UUID userId, @PathVariable UUID id) {
    calendarEventService.delete(userId, id);
  }
}
