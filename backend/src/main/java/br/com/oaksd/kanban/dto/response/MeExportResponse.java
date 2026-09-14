package br.com.oaksd.kanban.dto.response;

import java.util.List;

// Full personal-data export (LGPD-style right to portability): everything
// scoped by userId, nothing derived that isn't already in StatsResponse.
public record MeExportResponse(
    UserResponse user,
    List<CardResponse> cards,
    List<GoalResponse> goals,
    List<XpEventResponse> xpEvents,
    List<FocusSessionResponse> focusSessions,
    StatsResponse stats) {
}
