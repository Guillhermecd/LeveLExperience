package br.com.oaksd.kanban.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.oaksd.kanban.dto.request.CreateCalendarEventRequest;
import br.com.oaksd.kanban.dto.response.CalendarEventResponse;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.security.CurrentUserArgumentResolver;
import br.com.oaksd.kanban.security.JwtService;
import br.com.oaksd.kanban.service.CalendarEventService;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

/**
 * HTTP slice for the agenda: routing, request binding, bean validation and the
 * status each service exception maps to. Business rules live in
 * {@code CalendarEventServiceTest}.
 */
// Filters are off (same reasoning as AuthControllerTest), but @CurrentUser
// reads the SecurityContext directly, so @WithMockUser still supplies the id.
@WebMvcTest(CalendarEventController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(CurrentUserArgumentResolver.class)
@WithMockUser(username = CalendarEventControllerTest.USER_ID)
class CalendarEventControllerTest {

  static final String USER_ID = "11111111-1111-4111-8111-111111111111";
  private static final String EVENT_ID = "22222222-2222-4222-8222-222222222222";
  private static final Instant START = Instant.parse("2026-09-15T13:00:00Z");
  private static final Instant END = Instant.parse("2026-09-15T14:00:00Z");

  @Autowired private MockMvc mockMvc;
  @MockBean private CalendarEventService calendarEventService;
  @MockBean private JwtService jwtService;

  private static String createBody(String title, String color, String startsAt, String endsAt) {
    return """
        {"id":"%s","title":"%s","description":"Levar exames","startsAt":%s,"endsAt":%s,"color":"%s"}
        """.formatted(EVENT_ID, title, quoted(startsAt), quoted(endsAt), color);
  }

  private static String quoted(String value) {
    return value == null ? "null" : "\"" + value + "\"";
  }

  private static CalendarEventResponse response() {
    return new CalendarEventResponse(
        UUID.fromString(EVENT_ID), "Consulta", "Levar exames", START, END, "lime");
  }

  // --- GET ---------------------------------------------------------------

  @Test
  void list_withoutRange_delegatesNullBounds() throws Exception {
    when(calendarEventService.list(any(), any(), any())).thenReturn(List.of());

    mockMvc.perform(get("/api/calendar-events")).andExpect(status().isOk());

    verify(calendarEventService).list(UUID.fromString(USER_ID), null, null);
  }

  // The one place @DateTimeFormat(ISO.DATE_TIME) on an Instant param can break.
  // The literals are the exact shape dayjs' toISOString() sends from
  // monthRange() in the frontend.
  @Test
  void list_withIsoRange_bindsTheMonthBoundariesAsInstants() throws Exception {
    when(calendarEventService.list(any(), any(), any())).thenReturn(List.of());

    mockMvc.perform(get("/api/calendar-events")
            .param("from", "2026-09-01T03:00:00.000Z")
            .param("to", "2026-10-01T02:59:59.999Z"))
        .andExpect(status().isOk());

    ArgumentCaptor<Instant> from = ArgumentCaptor.forClass(Instant.class);
    ArgumentCaptor<Instant> to = ArgumentCaptor.forClass(Instant.class);
    verify(calendarEventService).list(eq(UUID.fromString(USER_ID)), from.capture(), to.capture());
    assertThat(from.getValue()).isEqualTo(Instant.parse("2026-09-01T03:00:00Z"));
    assertThat(to.getValue()).isEqualTo(Instant.parse("2026-10-01T02:59:59.999Z"));
  }

  @Test
  void list_withUnparseableFrom_returns400() throws Exception {
    mockMvc.perform(get("/api/calendar-events").param("from", "15/09/2026").param("to", "hoje"))
        .andExpect(status().isBadRequest());
  }

  @Test
  void list_returnsTheAgendaContract() throws Exception {
    when(calendarEventService.list(any(), any(), any())).thenReturn(List.of(response()));

    mockMvc.perform(get("/api/calendar-events"))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].id").value(EVENT_ID))
        .andExpect(jsonPath("$[0].startsAt").value("2026-09-15T13:00:00Z"))
        // Ownership never crosses the wire.
        .andExpect(jsonPath("$[0].userId").doesNotExist());
  }

  // --- POST --------------------------------------------------------------

  @Test
  void create_withValidBody_returns201WithTheEventContract() throws Exception {
    when(calendarEventService.create(any(), any())).thenReturn(response());

    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("Consulta", "lime", "2026-09-15T13:00:00Z", "2026-09-15T14:00:00Z")))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(EVENT_ID))
        .andExpect(jsonPath("$.title").value("Consulta"))
        .andExpect(jsonPath("$.color").value("lime"))
        .andExpect(jsonPath("$.endsAt").value("2026-09-15T14:00:00Z"));
  }

  @Test
  void create_usesTheAuthenticatedUserAndTheClientGeneratedId() throws Exception {
    when(calendarEventService.create(any(), any())).thenReturn(response());

    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("Consulta", "lime", "2026-09-15T13:00:00Z", null)))
        .andExpect(status().isCreated());

    ArgumentCaptor<CreateCalendarEventRequest> captor =
        ArgumentCaptor.forClass(CreateCalendarEventRequest.class);
    verify(calendarEventService).create(eq(UUID.fromString(USER_ID)), captor.capture());
    assertThat(captor.getValue().id()).isEqualTo(UUID.fromString(EVENT_ID));
    assertThat(captor.getValue().endsAt()).isNull();
  }

  @Test
  void create_withBlankTitle_returns400() throws Exception {
    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("   ", "lime", "2026-09-15T13:00:00Z", null)))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("title")));
  }

  @Test
  void create_withTitleOverTheColumnLimit_returns400() throws Exception {
    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("a".repeat(256), "lime", "2026-09-15T13:00:00Z", null)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void create_withTitleExactlyAtTheLimit_isAccepted() throws Exception {
    when(calendarEventService.create(any(), any())).thenReturn(response());

    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("a".repeat(255), "lime", "2026-09-15T13:00:00Z", null)))
        .andExpect(status().isCreated());
  }

  // The regexp mirrors calendar_events_color_valid. An unlisted colour must be
  // a readable 400 here, never a constraint violation at flush.
  @Test
  void create_withUnknownColor_returns400() throws Exception {
    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("Consulta", "rainbow", "2026-09-15T13:00:00Z", null)))
        .andExpect(status().isBadRequest());
  }

  // @Pattern matches the whole value, so a valid colour as a prefix is still
  // rejected — this pins that the alternation is not accidentally a "contains".
  @Test
  void create_withAColorThatMerelyStartsWithAValidOne_returns400() throws Exception {
    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("Consulta", "limelight", "2026-09-15T13:00:00Z", null)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void create_withoutStartsAt_returns400() throws Exception {
    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("Consulta", "lime", null, null)))
        .andExpect(status().isBadRequest());
  }

  @Test
  void create_withoutId_returns400() throws Exception {
    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"title":"Consulta","startsAt":"2026-09-15T13:00:00Z","color":"lime"}
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void create_withAnIdOwnedByAnotherUser_returns409() throws Exception {
    when(calendarEventService.create(any(), any()))
        .thenThrow(new ConflictException("Este identificador de compromisso já está em uso."));

    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("Consulta", "lime", "2026-09-15T13:00:00Z", null)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message")
            .value("Este identificador de compromisso já está em uso."));
  }

  // The interval rule is a service decision; what the slice pins is that it
  // surfaces as a readable 400 and not as a 500.
  @Test
  void create_withEndBeforeStart_returns400WithTheServiceMessage() throws Exception {
    when(calendarEventService.create(any(), any())).thenThrow(
        new br.com.oaksd.kanban.exception.BusinessException(
            org.springframework.http.HttpStatus.BAD_REQUEST,
            "O término não pode ser antes do início."));

    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("Consulta", "lime", "2026-09-15T14:00:00Z", "2026-09-15T13:00:00Z")))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.message").value("O término não pode ser antes do início."));
  }

  // --- PATCH / DELETE ----------------------------------------------------

  @Test
  void update_withValidBody_returns200() throws Exception {
    when(calendarEventService.update(any(), any(), any())).thenReturn(response());

    mockMvc.perform(patch("/api/calendar-events/" + EVENT_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"title":"Dentista","startsAt":"2026-09-15T13:00:00Z","color":"violet"}
                """))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.id").value(EVENT_ID));

    verify(calendarEventService)
        .update(eq(UUID.fromString(USER_ID)), eq(UUID.fromString(EVENT_ID)), any());
  }

  @Test
  void update_withUnknownColor_returns400() throws Exception {
    mockMvc.perform(patch("/api/calendar-events/" + EVENT_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"title":"Dentista","startsAt":"2026-09-15T13:00:00Z","color":"rainbow"}
                """))
        .andExpect(status().isBadRequest());
  }

  // 404, never 403 (decision #5).
  @Test
  void update_ofAnotherUsersEvent_returns404() throws Exception {
    when(calendarEventService.update(any(), any(), any()))
        .thenThrow(new NotFoundException("Compromisso não encontrado."));

    mockMvc.perform(patch("/api/calendar-events/" + EVENT_ID)
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"title":"Dentista","startsAt":"2026-09-15T13:00:00Z","color":"violet"}
                """))
        .andExpect(status().isNotFound())
        .andExpect(jsonPath("$.message").value("Compromisso não encontrado."));
  }

  @Test
  void update_withAMalformedId_returns400() throws Exception {
    mockMvc.perform(patch("/api/calendar-events/not-a-uuid")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"title":"Dentista","startsAt":"2026-09-15T13:00:00Z","color":"violet"}
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void delete_ofOwnEvent_returns204WithNoBody() throws Exception {
    mockMvc.perform(delete("/api/calendar-events/" + EVENT_ID))
        .andExpect(status().isNoContent());

    verify(calendarEventService).delete(UUID.fromString(USER_ID), UUID.fromString(EVENT_ID));
  }

  @Test
  void delete_ofAnotherUsersEvent_returns404() throws Exception {
    org.mockito.Mockito.doThrow(new NotFoundException("Compromisso não encontrado."))
        .when(calendarEventService).delete(any(), any());

    mockMvc.perform(delete("/api/calendar-events/" + EVENT_ID))
        .andExpect(status().isNotFound());
  }

  // --- concurrency: the id race the client-generated id makes possible -----

  /**
   * Two tabs POSTing the same client-generated id at once: one insert wins,
   * the loser's transaction blows up on the primary key. The handler must tell
   * the user something about their appointment.
   *
   * <p>Fixed: GlobalExceptionHandler.handleConflict now reads the constraint
   * name out of the root cause and only blames e-mail for the
   * users_email_unique race (BUG-CAL-1).
   */
  @Test
  void create_losingTheDuplicateIdRace_doesNotBlameTheEmail() throws Exception {
    when(calendarEventService.create(any(), any()))
        .thenThrow(new DataIntegrityViolationException("duplicate key value violates "
            + "unique constraint \"calendar_events_pkey\""));

    mockMvc.perform(post("/api/calendar-events")
            .contentType(MediaType.APPLICATION_JSON)
            .content(createBody("Consulta", "lime", "2026-09-15T13:00:00Z", null)))
        .andExpect(status().isConflict())
        .andExpect(jsonPath("$.message")
            .value(org.hamcrest.Matchers.not("Este e-mail já está cadastrado.")));
  }
}
