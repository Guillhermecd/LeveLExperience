package br.com.oaksd.kanban.mapper;

import br.com.oaksd.kanban.dto.response.FocusSessionResponse;
import br.com.oaksd.kanban.entity.FocusSession;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FocusSessionMapper {

  FocusSessionResponse toResponse(FocusSession session);
}
