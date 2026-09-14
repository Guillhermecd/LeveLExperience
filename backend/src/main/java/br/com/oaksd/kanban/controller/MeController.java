package br.com.oaksd.kanban.controller;

import br.com.oaksd.kanban.dto.response.MeExportResponse;
import br.com.oaksd.kanban.security.CurrentUser;
import br.com.oaksd.kanban.service.MeService;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

  private final MeService meService;

  public MeController(MeService meService) {
    this.meService = meService;
  }

  @GetMapping("/export")
  public MeExportResponse export(@CurrentUser UUID userId) {
    return meService.export(userId);
  }

  @DeleteMapping
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@CurrentUser UUID userId) {
    meService.deleteAccount(userId);
  }
}
