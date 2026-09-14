package br.com.oaksd.kanban.security;

import br.com.oaksd.kanban.dto.response.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

/**
 * Without this, Spring Security's default entry point answers a missing or invalid token with a
 * bare 403 — indistinguishable from an authenticated-but-forbidden response. The frontend's
 * refresh-and-retry flow (api.ts) only fires on 401, so an expired access token got stuck forever
 * instead of triggering a refresh. This returns 401 for "not authenticated", matching the
 * ErrorResponse shape the rest of the API already uses.
 */
@Component
public class JsonAuthenticationEntryPoint implements AuthenticationEntryPoint {

  private final ObjectMapper objectMapper;

  public JsonAuthenticationEntryPoint(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException)
      throws java.io.IOException {
    response.setStatus(HttpStatus.UNAUTHORIZED.value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    ErrorResponse body = new ErrorResponse(Instant.now(), HttpStatus.UNAUTHORIZED.value(),
        HttpStatus.UNAUTHORIZED.getReasonPhrase(), "Sessão expirada ou token inválido.");
    objectMapper.writeValue(response.getWriter(), body);
  }
}
