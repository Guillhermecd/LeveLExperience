package br.com.oaksd.kanban.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

  private final Jwt jwt = new Jwt();
  private final Email email = new Email();
  private final RateLimit rateLimit = new RateLimit();
  private String frontendBaseUrl;
  private String corsOrigins;

  public Jwt getJwt() {
    return jwt;
  }

  public Email getEmail() {
    return email;
  }

  public RateLimit getRateLimit() {
    return rateLimit;
  }

  public String getFrontendBaseUrl() {
    return frontendBaseUrl;
  }

  public void setFrontendBaseUrl(String frontendBaseUrl) {
    this.frontendBaseUrl = frontendBaseUrl;
  }

  public String getCorsOrigins() {
    return corsOrigins;
  }

  public void setCorsOrigins(String corsOrigins) {
    this.corsOrigins = corsOrigins;
  }

  public static class Jwt {
    private String secret;
    private long accessExpirationMs;
    private long refreshExpirationMs;

    public String getSecret() {
      return secret;
    }

    public void setSecret(String secret) {
      this.secret = secret;
    }

    public long getAccessExpirationMs() {
      return accessExpirationMs;
    }

    public void setAccessExpirationMs(long accessExpirationMs) {
      this.accessExpirationMs = accessExpirationMs;
    }

    public long getRefreshExpirationMs() {
      return refreshExpirationMs;
    }

    public void setRefreshExpirationMs(long refreshExpirationMs) {
      this.refreshExpirationMs = refreshExpirationMs;
    }
  }

  public static class Email {
    private boolean enabled;
    private String from;

    public boolean isEnabled() {
      return enabled;
    }

    public void setEnabled(boolean enabled) {
      this.enabled = enabled;
    }

    public String getFrom() {
      return from;
    }

    public void setFrom(String from) {
      this.from = from;
    }
  }

  public static class RateLimit {
    private int maxAttempts;
    private int windowMinutes;

    public int getMaxAttempts() {
      return maxAttempts;
    }

    public void setMaxAttempts(int maxAttempts) {
      this.maxAttempts = maxAttempts;
    }

    public int getWindowMinutes() {
      return windowMinutes;
    }

    public void setWindowMinutes(int windowMinutes) {
      this.windowMinutes = windowMinutes;
    }
  }
}
