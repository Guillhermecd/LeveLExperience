package br.com.oaksd.kanban.service;

import java.util.Optional;
import org.springframework.stereotype.Service;

// position is a double (PLAN.md decision #7): appending is always the
// current max plus a fixed gap, leaving room for /move to insert between
// two rows later without touching anything else.
@Service
public class PositionService {

  private static final double GAP = 1024.0;

  public double appendAfter(Optional<Double> currentMax) {
    return currentMax.orElse(0.0) + GAP;
  }
}
