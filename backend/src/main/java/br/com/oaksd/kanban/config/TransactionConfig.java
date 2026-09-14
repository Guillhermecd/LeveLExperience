package br.com.oaksd.kanban.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Nested transactions are off by default in Spring (AbstractPlatformTransactionManager). We need
 * them: XpEventInserter opens a real Postgres SAVEPOINT so a duplicate idempotency key rolls back
 * only the offending insert, not the whole settlement transaction (see XpEventInserter).
 */
@Configuration
public class TransactionConfig {

  @Bean
  public PlatformTransactionManager transactionManager(EntityManagerFactory entityManagerFactory) {
    JpaTransactionManager transactionManager = new JpaTransactionManager(entityManagerFactory);
    transactionManager.setNestedTransactionAllowed(true);
    return transactionManager;
  }
}
