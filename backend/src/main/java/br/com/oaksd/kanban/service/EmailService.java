package br.com.oaksd.kanban.service;

import br.com.oaksd.kanban.config.AppProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

// PLAN.md: "Falha no boot [do Mailpit] gera apenas warning" — the same
// tolerance applies here. A dead SMTP server must never roll back a
// registration or a password-reset request, so every send is best-effort and
// deferred until the surrounding transaction actually commits.
@Service
public class EmailService {

  private static final Logger log = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;
  private final AppProperties properties;

  public EmailService(JavaMailSender mailSender, AppProperties properties) {
    this.mailSender = mailSender;
    this.properties = properties;
  }

  public void sendVerificationEmail(String to, String token) {
    String link = properties.getFrontendBaseUrl() + "/verificar-email?token=" + token;
    sendAfterCommit(to, "Confirme seu e-mail",
        "Bem-vindo! Confirme seu cadastro clicando no link abaixo:\n\n" + link
            + "\n\nSe você não criou esta conta, ignore este e-mail.");
  }

  public void sendPasswordResetEmail(String to, String token) {
    String link = properties.getFrontendBaseUrl() + "/redefinir-senha?token=" + token;
    sendAfterCommit(to, "Redefinição de senha",
        "Recebemos um pedido para redefinir sua senha. Clique no link abaixo:\n\n" + link
            + "\n\nSe você não pediu isso, ignore este e-mail.");
  }

  private void sendAfterCommit(String to, String subject, String body) {
    Runnable send = () -> {
      if (!properties.getEmail().isEnabled()) {
        return;
      }
      try {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(properties.getEmail().getFrom());
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
      } catch (Exception ex) {
        log.warn("Falha ao enviar e-mail para {}: {}", to, ex.getMessage());
      }
    };

    if (TransactionSynchronizationManager.isSynchronizationActive()) {
      TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
        @Override
        public void afterCommit() {
          send.run();
        }
      });
    } else {
      send.run();
    }
  }
}
