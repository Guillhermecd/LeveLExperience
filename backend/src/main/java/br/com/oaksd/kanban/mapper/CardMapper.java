package br.com.oaksd.kanban.mapper;

import br.com.oaksd.kanban.dto.response.CardResponse;
import br.com.oaksd.kanban.dto.response.SubtaskResponse;
import br.com.oaksd.kanban.entity.Card;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CardMapper {

  @Mapping(target = "subtasks", source = "subtasks")
  CardResponse toResponse(Card card, List<SubtaskResponse> subtasks);
}
