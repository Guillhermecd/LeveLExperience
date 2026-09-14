package br.com.oaksd.kanban.service;

import java.util.List;
import java.util.Map;

/** In-memory mirror of xp-rules.json, shared by the settlement engine and its tests. */
public record XpRulesTable(
    Map<Short, Integer> xpCardByPriority,
    Map<String, Integer> xpGoalByScope,
    int xpSubtask,
    int xpCleanDay,
    int xpFocusMinimum,
    List<LevelRow> levels,
    List<String> ranks) {

  public record LevelRow(int level, int threshold, int cost, String rank) {
  }
}
