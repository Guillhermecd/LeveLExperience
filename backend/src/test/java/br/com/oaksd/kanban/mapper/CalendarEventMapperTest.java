package br.com.oaksd.kanban.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import br.com.oaksd.kanban.dto.response.CalendarEventResponse;
import br.com.oaksd.kanban.entity.CalendarEvent;
import java.lang.reflect.RecordComponent;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/**
 * The service mocks this mapper, so nothing else exercises the MapStruct
 * output. These tests run the generated impl and pin the wire contract of
 * GET/POST /api/calendar-events.
 */
class CalendarEventMapperTest {

  private static final Instant START = Instant.parse("2026-09-15T13:00:00Z");
  private static final Instant END = Instant.parse("2026-09-15T14:00:00Z");

  private final CalendarEventMapper mapper = new CalendarEventMapperImpl();

  private static CalendarEvent event(UUID id, String title) {
    CalendarEvent calendarEvent = new CalendarEvent();
    calendarEvent.setId(id);
    calendarEvent.setUserId(UUID.randomUUID());
    calendarEvent.setTitle(title);
    calendarEvent.setDescription("Levar exames");
    calendarEvent.setStartsAt(START);
    calendarEvent.setEndsAt(END);
    calendarEvent.setColor("violet");
    return calendarEvent;
  }

  @Test
  void toResponse_copiesEveryExposedField() {
    UUID id = UUID.randomUUID();

    CalendarEventResponse response = mapper.toResponse(event(id, "Consulta"));

    assertThat(response.id()).isEqualTo(id);
    assertThat(response.title()).isEqualTo("Consulta");
    assertThat(response.description()).isEqualTo("Levar exames");
    assertThat(response.startsAt()).isEqualTo(START);
    assertThat(response.endsAt()).isEqualTo(END);
    assertThat(response.color()).isEqualTo("violet");
  }

  // "Entity nunca sai do backend": ownership and audit columns must not become
  // part of the JSON. This fails the day someone adds a field to the record.
  @Test
  void response_exposesOnlyTheAgendaFields() {
    assertThat(Arrays.stream(CalendarEventResponse.class.getRecordComponents())
        .map(RecordComponent::getName))
        .containsExactlyInAnyOrder("id", "title", "description", "startsAt", "endsAt", "color");
  }

  @Test
  void toResponse_keepsAnOpenEndedEventOpenEnded() {
    CalendarEvent calendarEvent = event(UUID.randomUUID(), "Lembrete");
    calendarEvent.setEndsAt(null);
    calendarEvent.setDescription(null);

    CalendarEventResponse response = mapper.toResponse(calendarEvent);

    assertThat(response.endsAt()).isNull();
    assertThat(response.description()).isNull();
  }

  @Test
  void toResponse_preservesUnicodeAndAMaximumLengthTitle() {
    String title = "Reunião 🎯 ".repeat(23) + "fim";
    CalendarEvent calendarEvent = event(UUID.randomUUID(), title);

    assertThat(mapper.toResponse(calendarEvent).title()).isEqualTo(title);
  }

  @Test
  void toResponse_ofNull_isNull() {
    assertThat(mapper.toResponse(null)).isNull();
  }

  @Test
  void toResponseList_preservesOrder() {
    UUID first = UUID.randomUUID();
    UUID second = UUID.randomUUID();

    List<CalendarEventResponse> responses =
        mapper.toResponseList(List.of(event(first, "Primeiro"), event(second, "Segundo")));

    assertThat(responses).extracting(CalendarEventResponse::id).containsExactly(first, second);
  }

  @Test
  void toResponseList_ofEmpty_isEmpty() {
    assertThat(mapper.toResponseList(List.of())).isEmpty();
  }

  @Test
  void toResponseList_ofNull_isNull() {
    assertThat(mapper.toResponseList(null)).isNull();
  }
}
