package br.com.oaksd.kanban.exception;

import br.com.oaksd.kanban.dto.response.ErrorResponse;
import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(BusinessException.class)
  public ResponseEntity<ErrorResponse> handleBusiness(BusinessException ex) {
    return build(ex.getStatus(), ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
    String message = ex.getBindingResult().getFieldErrors().stream()
        .findFirst()
        .map(error -> error.getField() + ": " + error.getDefaultMessage())
        .orElse("Dados inválidos.");
    return build(HttpStatus.BAD_REQUEST, message);
  }

  // Fires whenever a DB constraint wins a race the app didn't pre-check
  // (PLAN.md decision #5 spirit: the constraint decides, no pre-check
  // SELECT) — not just the users_email_unique race this originally handled.
  // Every constraint gets a status of 409 either way; only the email one
  // gets a tailored message, because it's the one case the client can act
  // on directly (pick another address). Everything else — a calendar id
  // collision, an invite race, any future table — falls back to a message
  // that doesn't blame the wrong field.
  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ErrorResponse> handleConflict(DataIntegrityViolationException ex) {
    String message = "users_email_unique".equals(constraintName(ex))
        ? "Este e-mail já está cadastrado."
        : "Não foi possível salvar por um conflito de dados. Tente novamente.";
    return build(HttpStatus.CONFLICT, message);
  }

  private static final Pattern CONSTRAINT_NAME_PATTERN = Pattern.compile("constraint \"([^\"]+)\"");

  // Postgres' JDBC driver embeds the constraint name in the root cause's
  // message (e.g. `violates unique constraint "goals_pkey"`) — there's no
  // typed accessor for it on DataIntegrityViolationException.
  private String constraintName(DataIntegrityViolationException ex) {
    Throwable rootCause = ex.getMostSpecificCause();
    String rootMessage = rootCause == null ? null : rootCause.getMessage();
    if (rootMessage == null) return null;
    Matcher matcher = CONSTRAINT_NAME_PATTERN.matcher(rootMessage);
    return matcher.find() ? matcher.group(1) : null;
  }

  private ResponseEntity<ErrorResponse> build(HttpStatus status, String message) {
    return ResponseEntity.status(status)
        .body(new ErrorResponse(Instant.now(), status.value(), status.getReasonPhrase(), message));
  }
}
