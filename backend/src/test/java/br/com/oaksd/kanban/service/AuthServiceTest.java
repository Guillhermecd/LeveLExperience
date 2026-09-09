package br.com.oaksd.kanban.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import br.com.oaksd.kanban.dto.request.RegisterRequest;
import br.com.oaksd.kanban.dto.response.AuthResponse;
import br.com.oaksd.kanban.dto.response.UserResponse;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.exception.UnauthorizedException;
import br.com.oaksd.kanban.mapper.UserMapper;
import br.com.oaksd.kanban.repository.UserRepository;
import br.com.oaksd.kanban.repository.UserStatsRepository;
import br.com.oaksd.kanban.security.JwtService;
import br.com.oaksd.kanban.security.RateLimiter;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

  @Mock private UserRepository userRepository;
  @Mock private UserStatsRepository userStatsRepository;
  @Mock private InviteService inviteService;
  @Mock private TokenService tokenService;
  @Mock private EmailService emailService;
  @Mock private JwtService jwtService;
  @Mock private RateLimiter rateLimiter;
  @Mock private PasswordEncoder passwordEncoder;
  @Mock private UserMapper userMapper;

  private AuthService authService;

  @BeforeEach
  void setUp() {
    authService = new AuthService(userRepository, userStatsRepository, inviteService, tokenService,
        emailService, jwtService, rateLimiter, passwordEncoder, userMapper);
  }

  @Test
  void register_savesUserStatsAndSendsVerificationEmail() {
    RegisterRequest request = new RegisterRequest("INVITE1", "new@example.com", "senha12345", "Nova");
    when(passwordEncoder.encode("senha12345")).thenReturn("hashed");
    when(tokenService.issueEmailVerificationToken(any())).thenReturn("verify-token");
    when(tokenService.issueRefreshToken(any(), any())).thenReturn("refresh-token");
    when(jwtService.generateAccessToken(any())).thenReturn("access-token");
    when(jwtService.getAccessExpirationSeconds()).thenReturn(900L);
    when(userMapper.toResponse(any())).thenReturn(
        new UserResponse(UUID.randomUUID(), "new@example.com", "Nova", "America/Sao_Paulo", true, false));

    AuthResponse response = authService.register(request, "test-agent");

    verify(userRepository).saveAndFlush(any(User.class));
    verify(inviteService).consume(eq("INVITE1"), eq("new@example.com"), any());
    verify(userStatsRepository).save(any());
    verify(emailService).sendVerificationEmail(eq("new@example.com"), eq("verify-token"));
    assertThat(response.accessToken()).isEqualTo("access-token");
    assertThat(response.refreshToken()).isEqualTo("refresh-token");
  }

  @Test
  void register_propagatesInviteRejectionWithoutSendingEmail() {
    RegisterRequest request = new RegisterRequest("BAD", "new@example.com", "senha12345", "Nova");
    when(passwordEncoder.encode(anyString())).thenReturn("hashed");
    doThrow(new UnauthorizedException("Convite inválido."))
        .when(inviteService).consume(eq("BAD"), eq("new@example.com"), any());

    assertThatThrownBy(() -> authService.register(request, "test-agent"))
        .isInstanceOf(UnauthorizedException.class);

    verify(emailService, never()).sendVerificationEmail(any(), any());
  }

  @Test
  void login_unknownEmail_throwsUnauthorizedWithoutLeakingWhichFieldFailed() {
    when(userRepository.findByEmail("ghost@example.com")).thenReturn(Optional.empty());

    assertThatThrownBy(() -> authService.login("ghost@example.com", "whatever", "127.0.0.1", "agent"))
        .isInstanceOf(UnauthorizedException.class)
        .hasMessage("E-mail ou senha inválidos.");
  }

  @Test
  void login_wrongPassword_throwsUnauthorizedWithSameMessageAsUnknownEmail() {
    User user = new User();
    user.setEmail("real@example.com");
    user.setPasswordHash("hashed");
    when(userRepository.findByEmail("real@example.com")).thenReturn(Optional.of(user));
    when(passwordEncoder.matches("wrong", "hashed")).thenReturn(false);

    assertThatThrownBy(() -> authService.login("real@example.com", "wrong", "127.0.0.1", "agent"))
        .isInstanceOf(UnauthorizedException.class)
        .hasMessage("E-mail ou senha inválidos.");
  }

  @Test
  void login_ratelimited_neverReachesTheDatabase() {
    doThrow(new br.com.oaksd.kanban.exception.TooManyRequestsException("Muitas tentativas."))
        .when(rateLimiter).checkAndRecord(eq("login:ip:127.0.0.1"), anyString());

    assertThatThrownBy(() -> authService.login("real@example.com", "whatever", "127.0.0.1", "agent"))
        .isInstanceOf(br.com.oaksd.kanban.exception.TooManyRequestsException.class);

    verify(userRepository, never()).findByEmail(anyString());
  }

  @Test
  void resetPassword_revokesEverySessionForTheUser() {
    UUID userId = UUID.randomUUID();
    User user = new User();
    user.setEmail("real@example.com");
    when(tokenService.consumeAuthToken(eq("reset-token"), any())).thenReturn(userId);
    when(userRepository.findById(userId)).thenReturn(Optional.of(user));
    when(passwordEncoder.encode("novaSenha123")).thenReturn("newHash");

    authService.resetPassword("reset-token", "novaSenha123");

    verify(userRepository).save(user);
    assertThat(user.getPasswordHash()).isEqualTo("newHash");
    verify(tokenService).revokeAllSessions(userId);
  }
}
