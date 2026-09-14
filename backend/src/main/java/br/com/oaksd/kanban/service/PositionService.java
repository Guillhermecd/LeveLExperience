package br.com.oaksd.kanban.service;

import java.util.Optional;
import org.springframework.stereotype.Service;

// position is a double (PLAN.md decision #7): appending is always the
// current max plus a fixed gap, leaving room for /move to insert between
// two rows later without touching anything else — except when the gap
// between neighbours has collapsed below MIN_GAP, when the whole column
// gets renumbered (see CardService.rebalanceColumn).
@Service
public class PositionService {

  public static final double GAP = 1024.0;
  private static final double MIN_GAP = 0.0001;

  public double appendAfter(Optional<Double> currentMax) {
    return currentMax.orElse(0.0) + GAP;
  }

  /** Position for "insert before the current first row" — positions may go negative, that's fine. */
  public double before(double firstPosition) {
    return firstPosition - GAP;
  }

  public double between(double before, double after) {
    return before + (after - before) / 2;
  }

  public boolean needsRebalance(double before, double after) {
    return (after - before) < MIN_GAP;
  }
}
