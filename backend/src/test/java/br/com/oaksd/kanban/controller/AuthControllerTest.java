package br.com.oaksd.kanban.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import br.com.oaksd.kanban.dto.response.AuthResponse;
import br.com.oaksd.kanban.dto.response.UserResponse;
import br.com.oaksd.kanban.exception.UnauthorizedException;
import br.com.oaksd.kanban.security.JwtService;
import br.com.oaksd.kanban.service.AuthService;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

// Security filters are off here: this slice checks routing, validation and
// error mapping, not authentication (SecurityConfig has its own concern).
@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

  @Autowired private MockMvc mockMvc;
  @MockBean private AuthService authService;
  // JwtAuthenticationFilter is a Filter, so @WebMvcTest instantiates it even
  // with addFilters=false — it just needs its dependency satisfied.
  @MockBean private JwtService jwtService;

  @Test
  void register_withValidBody_returns201() throws Exception {
    UserResponse user = new UserResponse(UUID.randomUUID(), "new@example.com", "Nova",
        "America/Sao_Paulo", true, false);
    when(authService.register(any(), anyString()))
        .thenReturn(new AuthResponse("access", "refresh", 900L, user));

    mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .header("User-Agent", "test-agent")
            .content("""
                {"inviteCode":"INVITE1","email":"new@example.com","password":"senha12345","name":"Nova"}
                """))
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.accessToken").value("access"));
  }

  @Test
  void register_withBlankEmail_returns400() throws Exception {
    mockMvc.perform(post("/api/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"inviteCode":"INVITE1","email":"","password":"senha12345"}
                """))
        .andExpect(status().isBadRequest());
  }

  @Test
  void login_withWrongCredentials_returns401() throws Exception {
    when(authService.login(anyString(), anyString(), anyString(), anyString()))
        .thenThrow(new UnauthorizedException("E-mail ou senha inválidos."));

    mockMvc.perform(post("/api/auth/login")
            .contentType(MediaType.APPLICATION_JSON)
            .header("User-Agent", "test-agent")
            .content("""
                {"email":"real@example.com","password":"wrong"}
                """))
        .andExpect(status().isUnauthorized())
        .andExpect(jsonPath("$.message").value("E-mail ou senha inválidos."));
  }

  @Test
  void forgotPassword_alwaysReturns204() throws Exception {
    mockMvc.perform(post("/api/auth/forgot-password")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {"email":"ghost@example.com"}
                """))
        .andExpect(status().isNoContent());
  }
}
