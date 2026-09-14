package br.com.oaksd.kanban.controller;

import br.com.oaksd.kanban.dto.response.BoardResponse;
import br.com.oaksd.kanban.security.CurrentUser;
import br.com.oaksd.kanban.service.BoardService;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/board")
public class BoardController {

  private final BoardService boardService;

  public BoardController(BoardService boardService) {
    this.boardService = boardService;
  }

  @GetMapping
  public BoardResponse getBoard(@CurrentUser UUID userId) {
    return boardService.getBoard(userId);
  }
}
