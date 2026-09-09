package br.com.oaksd.kanban.repository;

import br.com.oaksd.kanban.entity.UserStats;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserStatsRepository extends JpaRepository<UserStats, UUID> {
}
