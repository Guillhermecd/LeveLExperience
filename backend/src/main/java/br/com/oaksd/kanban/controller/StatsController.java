package br.com.oaksd.kanban.controller;

import br.com.oaksd.kanban.dto.response.StatsResponse;
import br.com.oaksd.kanban.security.CurrentUser;
import br.com.oaksd.kanban.service.StatsService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

  private final StatsService statsService;

  public StatsController(StatsService statsService) {
    this.statsService = statsService;
  }

  @GetMapping
  public StatsResponse getStats(@CurrentUser UUID userId) {
    return statsService.getStats(userId);
  }
}
