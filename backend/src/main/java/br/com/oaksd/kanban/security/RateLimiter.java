package br.com.oaksd.kanban.security;

import br.com.oaksd.kanban.config.AppProperties;
import br.com.oaksd.kanban.exception.TooManyRequestsException;
import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Component;

// Fixed-window counter, in-memory (GATES 6.4: 20 attempts -> 429). Single
// instance only — debt if the app ever runs behind more than one node.
@Component
public class RateLimiter {

  private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();
  private final int maxAttempts;
  private final Duration windowSize;

  public RateLimiter(AppProperties properties) {
    this.maxAttempts = properties.getRateLimit().getMaxAttempts();
    this.windowSize = Duration.ofMinutes(properties.getRateLimit().getWindowMinutes());
  }

  public void checkAndRecord(String key, String actionLabel) {
    Instant now = Instant.now();
    Window window = windows.compute(key, (k, existing) -> {
      if (existing == null || existing.expiresAt.isBefore(now)) {
        return new Window(1, now.plus(windowSize));
      }
      return new Window(existing.count + 1, existing.expiresAt);
    });
    if (window.count > maxAttempts) {
      throw new TooManyRequestsException(
          "Muitas tentativas de " + actionLabel + ". Tente novamente mais tarde.");
    }
  }

  private record Window(int count, Instant expiresAt) {
  }
}
