package br.com.oaksd.kanban.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Reads xp-rules.json from the classpath (copied from the repo root by the resources plugin —
 * see pom.xml). Frontend and backend read the exact same file: a rule change breaks both suites.
 */
public final class XpRulesTableLoader {

  private XpRulesTableLoader() {
  }

  public static XpRulesTable load() {
    try (InputStream in = XpRulesTableLoader.class.getResourceAsStream("/xp-rules.json")) {
      if (in == null) {
        throw new IllegalStateException("xp-rules.json não encontrado no classpath.");
      }
      JsonNode root = new ObjectMapper().readTree(in);
      JsonNode constants = root.get("constants");

      Map<Short, Integer> xpCardByPriority = new LinkedHashMap<>();
      Iterator<Map.Entry<String, JsonNode>> cardFields = constants.get("xpCardByPriority").fields();
      while (cardFields.hasNext()) {
        Map.Entry<String, JsonNode> entry = cardFields.next();
        xpCardByPriority.put(Short.parseShort(entry.getKey()), entry.getValue().asInt());
      }

      Map<String, Integer> xpGoalByScope = new LinkedHashMap<>();
      Iterator<Map.Entry<String, JsonNode>> goalFields = constants.get("xpGoal").fields();
      while (goalFields.hasNext()) {
        Map.Entry<String, JsonNode> entry = goalFields.next();
        xpGoalByScope.put(entry.getKey(), entry.getValue().asInt());
      }

      List<String> ranks = new ArrayList<>();
      constants.get("ranks").forEach(node -> ranks.add(node.asText()));

      List<XpRulesTable.LevelRow> levels = new ArrayList<>();
      root.get("levels").forEach(node -> levels.add(new XpRulesTable.LevelRow(
          node.get("level").asInt(),
          node.get("threshold").asInt(),
          node.get("cost").asInt(),
          node.get("rank").asText())));

      return new XpRulesTable(
          xpCardByPriority,
          xpGoalByScope,
          constants.get("xpSubtask").asInt(),
          constants.get("xpCleanDay").asInt(),
          constants.get("xpFocusMinimum").asInt(),
          levels,
          ranks);
    } catch (IOException e) {
      throw new IllegalStateException("Falha ao ler xp-rules.json", e);
    }
  }
}
