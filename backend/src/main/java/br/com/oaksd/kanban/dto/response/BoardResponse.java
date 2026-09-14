package br.com.oaksd.kanban.dto.response;

import java.util.List;

public record BoardResponse(List<CardResponse> cards, List<GoalResponse> goals) {
}
