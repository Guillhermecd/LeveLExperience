-- =============================================================================
-- Calendar events (compromissos/lembretes do usuário)
-- Flyway: V3__add_calendar_events_table.sql
--
-- Fora do modelo de XP de propósito: criar um evento não é conquista, é agenda.
-- Nenhuma linha em xp_events nasce daqui.
--
-- Fora de escopo v1 (registrado, não construído): recorrência, evento de dia
-- inteiro (`all_day` seria uma DATA local, não um instante — outro modelo) e
-- constraint de "sem sobreposição" de horários.
-- =============================================================================

CREATE TABLE calendar_events (
  id          UUID        PRIMARY KEY,   -- client-generated (UUID v4)
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT,
  -- Instante, não data local: renderizado no fuso do navegador. users.timezone
  -- serve ao ledger de XP (xp_events.day), não à agenda.
  starts_at   TIMESTAMPTZ NOT NULL,
  ends_at     TIMESTAMPTZ,
  color       TEXT        NOT NULL DEFAULT 'lime',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT calendar_events_title_not_blank CHECK (length(btrim(title)) > 0),
  CONSTRAINT calendar_events_color_valid
    CHECK (color IN ('lime', 'amber', 'violet', 'coral', 'blue')),
  CONSTRAINT calendar_events_end_after_start
    CHECK (ends_at IS NULL OR ends_at >= starts_at)
);

CREATE TRIGGER calendar_events_set_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Serves the main query (GET /api/calendar-events?from=&to=): filters by owner,
-- ranges on starts_at, comes out sorted.
CREATE INDEX calendar_events_user_start_idx ON calendar_events (user_id, starts_at);
