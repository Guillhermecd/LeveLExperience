package br.com.oaksd.kanban.mapper;

import br.com.oaksd.kanban.dto.response.CalendarEventResponse;
import br.com.oaksd.kanban.entity.CalendarEvent;
import java.util.List;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CalendarEventMapper {

  CalendarEventResponse toResponse(CalendarEvent calendarEvent);

  List<CalendarEventResponse> toResponseList(List<CalendarEvent> calendarEvents);
}
