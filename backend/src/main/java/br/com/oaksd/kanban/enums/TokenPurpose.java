package br.com.oaksd.kanban.enums;

public enum TokenPurpose {
  EMAIL_VERIFICATION("email_verification"),
  PASSWORD_RESET("password_reset");

  private final String value;

  TokenPurpose(String value) {
    this.value = value;
  }

  public String value() {
    return value;
  }
}
