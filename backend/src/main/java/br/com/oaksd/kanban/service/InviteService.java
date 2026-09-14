package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.entity.Invite;
import br.com.oaksd.kanban.exception.ConflictException;
import br.com.oaksd.kanban.exception.UnauthorizedException;
import br.com.oaksd.kanban.repository.InviteRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;

@Service
public class InviteService {

  private final InviteRepository inviteRepository;

  public InviteService(InviteRepository inviteRepository) {
    this.inviteRepository = inviteRepository;
  }

  // Consumption is a DB-level UPDATE ... WHERE used_at IS NULL (PLAN.md
  // decision #5's spirit): the row count, not a prior SELECT, decides the race.
  public void consume(String code, String email, UUID userId) {
    Invite invite = inviteRepository.findByCode(code)
        .orElseThrow(() -> new UnauthorizedException("Convite inválido."));

    if (invite.getUsedAt() != null || invite.getExpiresAt().isBefore(Instant.now())) {
      throw new UnauthorizedException("Convite inválido ou expirado.");
    }
    if (invite.getEmail() != null && !invite.getEmail().equalsIgnoreCase(email)) {
      throw new UnauthorizedException("Este convite não é válido para este e-mail.");
    }

    int updated = inviteRepository.consume(code, userId, Instant.now());
    if (updated == 0) {
      throw new ConflictException("Este convite já foi usado.");
    }
  }
}
