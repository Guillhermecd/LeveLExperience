package br.com.oaksd.kanban.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends BusinessException {

  public ConflictException(String message) {
    super(HttpStatus.CONFLICT, message);
  }
}
