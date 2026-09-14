package br.com.oaksd.kanban.mapper;

import br.com.oaksd.kanban.dto.response.GoalResponse;
import br.com.oaksd.kanban.entity.Goal;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface GoalMapper {

  GoalResponse toResponse(Goal goal);

  List<GoalResponse> toResponseList(List<Goal> goals);
}
