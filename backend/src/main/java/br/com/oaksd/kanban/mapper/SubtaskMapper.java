package br.com.oaksd.kanban.mapper;

import br.com.oaksd.kanban.dto.response.SubtaskResponse;
import br.com.oaksd.kanban.entity.Subtask;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface SubtaskMapper {

  SubtaskResponse toResponse(Subtask subtask);

  List<SubtaskResponse> toResponseList(List<Subtask> subtasks);
}
