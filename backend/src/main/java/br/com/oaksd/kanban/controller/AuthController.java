package br.com.oaksd.kanban.controller;

import br.com.oaksd.kanban.dto.request.ForgotPasswordRequest;
import br.com.oaksd.kanban.dto.request.LoginRequest;
import br.com.oaksd.kanban.dto.request.LogoutRequest;
import br.com.oaksd.kanban.dto.request.RefreshRequest;
import br.com.oaksd.kanban.dto.request.RegisterRequest;
import br.com.oaksd.kanban.dto.request.ResetPasswordRequest;
import br.com.oaksd.kanban.dto.request.VerifyEmailRequest;
import br.com.oaksd.kanban.dto.response.AuthResponse;
import br.com.oaksd.kanban.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

  private final AuthService authService;

  public AuthController(AuthService authService) {
    this.authService = authService;
  }

  @PostMapping("/register")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse register(@Valid @RequestBody RegisterRequest request,
      @RequestHeader(value = "User-Agent", required = false) String userAgent) {
    return authService.register(request, userAgent);
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest servletRequest,
      @RequestHeader(value = "User-Agent", required = false) String userAgent) {
    return authService.login(request.email(), request.password(), clientIp(servletRequest), userAgent);
  }

  @PostMapping("/refresh")
  public AuthResponse refresh(@Valid @RequestBody RefreshRequest request,
      @RequestHeader(value = "User-Agent", required = false) String userAgent) {
    return authService.refresh(request.refreshToken(), userAgent);
  }

  @PostMapping("/logout")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void logout(@Valid @RequestBody LogoutRequest request) {
    authService.logout(request.refreshToken());
  }

  @PostMapping("/verify-email")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
    authService.verifyEmail(request.token());
  }

  @PostMapping("/forgot-password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, HttpServletRequest servletRequest) {
    authService.forgotPassword(request.email(), clientIp(servletRequest));
  }

  @PostMapping("/reset-password")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
    authService.resetPassword(request.token(), request.newPassword());
  }

  // Behind a reverse proxy in production, X-Forwarded-For carries the real
  // client; falls back to the socket address for local/dev.
  private String clientIp(HttpServletRequest request) {
    String forwardedFor = request.getHeader("X-Forwarded-For");
    if (StringUtils.hasText(forwardedFor)) {
      return forwardedFor.split(",")[0].trim();
    }
    return request.getRemoteAddr();
  }
}
