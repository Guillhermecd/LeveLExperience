package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.dto.request.RegisterRequest;
import br.com.oaksd.kanban.dto.response.AuthResponse;
import br.com.oaksd.kanban.entity.User;
import br.com.oaksd.kanban.entity.UserStats;
import br.com.oaksd.kanban.enums.TokenPurpose;
import br.com.oaksd.kanban.exception.NotFoundException;
import br.com.oaksd.kanban.exception.UnauthorizedException;
import br.com.oaksd.kanban.mapper.UserMapper;
import br.com.oaksd.kanban.repository.UserRepository;
import br.com.oaksd.kanban.repository.UserStatsRepository;
import br.com.oaksd.kanban.security.JwtService;
import br.com.oaksd.kanban.security.RateLimiter;
import java.time.Instant;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

  private final UserRepository userRepository;
  private final UserStatsRepository userStatsRepository;
  private final InviteService inviteService;
  private final TokenService tokenService;
  private final EmailService emailService;
  private final JwtService jwtService;
  private final RateLimiter rateLimiter;
  private final PasswordEncoder passwordEncoder;
  private final UserMapper userMapper;
  private final BoardSeedService boardSeedService;

  public AuthService(UserRepository userRepository, UserStatsRepository userStatsRepository,
      InviteService inviteService, TokenService tokenService, EmailService emailService,
      JwtService jwtService, RateLimiter rateLimiter, PasswordEncoder passwordEncoder,
      UserMapper userMapper, BoardSeedService boardSeedService) {
    this.userRepository = userRepository;
    this.userStatsRepository = userStatsRepository;
    this.inviteService = inviteService;
    this.tokenService = tokenService;
    this.emailService = emailService;
    this.jwtService = jwtService;
    this.rateLimiter = rateLimiter;
    this.passwordEncoder = passwordEncoder;
    this.userMapper = userMapper;
    this.boardSeedService = boardSeedService;
  }

  @Transactional
  public AuthResponse register(RegisterRequest request, String userAgent) {
    User user = new User();
    user.setEmail(request.email());
    user.setPasswordHash(passwordEncoder.encode(request.password()));
    user.setName(request.name());
    // users_email_unique fires as DataIntegrityViolationException -> 409
    // (GlobalExceptionHandler); no pre-check SELECT, per decision #5's spirit.
    // saveAndFlush: invite.consume() below is a native UPDATE that Hibernate's
    // auto-flush won't trigger for (it doesn't know the FK links the tables),
    // so without an explicit flush the insert isn't visible yet and the
    // invites_used_by_fkey constraint fails.
    userRepository.saveAndFlush(user);

    inviteService.consume(request.inviteCode(), request.email(), user.getId());

    UserStats stats = new UserStats();
    stats.setUserId(user.getId());
    userStatsRepository.save(stats);

    boardSeedService.seed(user.getId());

    String verificationToken = tokenService.issueEmailVerificationToken(user.getId());
    emailService.sendVerificationEmail(user.getEmail(), verificationToken);

    return issueSession(user, userAgent);
  }

  @Transactional
  public AuthResponse login(String email, String password, String clientIp, String userAgent) {
    rateLimiter.checkAndRecord("login:ip:" + clientIp, "login");
    rateLimiter.checkAndRecord("login:email:" + email.toLowerCase(), "login");

    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UnauthorizedException("E-mail ou senha inválidos."));
    if (!passwordEncoder.matches(password, user.getPasswordHash())) {
      throw new UnauthorizedException("E-mail ou senha inválidos.");
    }
    return issueSession(user, userAgent);
  }

  @Transactional
  public AuthResponse refresh(String refreshToken, String userAgent) {
    TokenService.RotationResult rotation = tokenService.rotateRefreshToken(refreshToken, userAgent);
    User user = userRepository.findById(rotation.userId())
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    String accessToken = jwtService.generateAccessToken(user.getId());
    return new AuthResponse(accessToken, rotation.newRawToken(), jwtService.getAccessExpirationSeconds(),
        userMapper.toResponse(user));
  }

  public void logout(String refreshToken) {
    tokenService.revokeRefreshToken(refreshToken);
  }

  @Transactional
  public void verifyEmail(String token) {
    UUID userId = tokenService.consumeAuthToken(token, TokenPurpose.EMAIL_VERIFICATION);
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    user.setEmailVerifiedAt(Instant.now());
    userRepository.save(user);
  }

  @Transactional
  public void forgotPassword(String email, String clientIp) {
    rateLimiter.checkAndRecord("reset:ip:" + clientIp, "redefinição de senha");
    rateLimiter.checkAndRecord("reset:email:" + email.toLowerCase(), "redefinição de senha");

    // Same response whether the e-mail exists or not (decision #12's sibling:
    // never let a response confirm what exists).
    userRepository.findByEmail(email).ifPresent(user -> {
      String token = tokenService.issuePasswordResetToken(user.getId());
      emailService.sendPasswordResetEmail(user.getEmail(), token);
    });
  }

  @Transactional
  public void resetPassword(String token, String newPassword) {
    UUID userId = tokenService.consumeAuthToken(token, TokenPurpose.PASSWORD_RESET);
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new NotFoundException("Usuário não encontrado."));
    user.setPasswordHash(passwordEncoder.encode(newPassword));
    userRepository.save(user);
    tokenService.revokeAllSessions(userId);
  }

  private AuthResponse issueSession(User user, String userAgent) {
    String accessToken = jwtService.generateAccessToken(user.getId());
    String refreshToken = tokenService.issueRefreshToken(user.getId(), userAgent);
    return new AuthResponse(accessToken, refreshToken, jwtService.getAccessExpirationSeconds(),
        userMapper.toResponse(user));
  }
}
