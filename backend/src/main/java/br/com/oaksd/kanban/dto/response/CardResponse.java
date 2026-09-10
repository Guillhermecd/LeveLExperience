package br.com.oaksd.kanban.dto.response;

import java.util.List;
import java.util.UUID;

public record CardResponse(
    UUID id,
    String columnKey,
    String title,
    short priority,
    short tag,
    double position,
    int poms,
    List<SubtaskResponse> subtasks) {
}
