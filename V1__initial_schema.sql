-- =============================================================================
-- Gamified Kanban — initial schema
-- Flyway: V1__initial_schema.sql
--
-- Applied principles:
--   * Card/subtask/goal IDs are client-generated UUIDs (idempotent upsert).
--   * XP is an append-only ledger; the total is a derivable cache.
--   * Any rule that must hold under concurrency becomes a constraint,
--     never an application-level `if`.
--   * Ordering via `position` double precision (insert between neighbours = 1 row).
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS citext;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -----------------------------------------------------------------------------
-- Automatic updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- USERS AND AUTHENTICATION
-- =============================================================================

CREATE TABLE users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             CITEXT      NOT NULL,
  password_hash     TEXT        NOT NULL,
  name              TEXT,
  -- "today" depends on the user timezone: streak and daily bonus break in UTC.
  timezone          TEXT        NOT NULL DEFAULT 'America/Sao_Paulo',
  -- The prototype's `mostrarMetas` prop becomes a stored preference
  show_goals        BOOLEAN     NOT NULL DEFAULT TRUE,
  email_verified_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT users_email_unique UNIQUE (email),
  CONSTRAINT users_email_format CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Invite-only sign-up. Going open = stop requiring the code.
CREATE TABLE invites (
  code       TEXT        PRIMARY KEY,
  email      CITEXT,                 -- NULL = generic invite
  created_by UUID        REFERENCES users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  used_by    UUID        REFERENCES users(id) ON DELETE SET NULL,

  -- used_at and used_by move together or not at all
  CONSTRAINT invites_usage_coherent
    CHECK ((used_at IS NULL) = (used_by IS NULL))
);

CREATE INDEX invites_email_idx ON invites (email) WHERE used_at IS NULL;

-- Email verification and password reset. We store the token HASH, never the
-- token itself: a database dump must not become account access.
CREATE TABLE auth_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose    TEXT        NOT NULL,
  token_hash TEXT        NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT auth_tokens_purpose_valid
    CHECK (purpose IN ('email_verification', 'password_reset')),
  CONSTRAINT auth_tokens_hash_unique UNIQUE (token_hash)
);

CREATE INDEX auth_tokens_user_purpose_idx ON auth_tokens (user_id, purpose);

-- Revocable refresh tokens: without them, changing the password does not
-- invalidate a session whose access token was already stolen.
CREATE TABLE refresh_tokens (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL,
  user_agent TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT refresh_tokens_hash_unique UNIQUE (token_hash)
);

CREATE INDEX refresh_tokens_user_active_idx
  ON refresh_tokens (user_id) WHERE revoked_at IS NULL;

-- =============================================================================
-- BOARD
-- =============================================================================

CREATE TABLE cards (
  id         UUID             PRIMARY KEY,   -- client-generated (UUID v4)
  user_id    UUID             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  column_key TEXT             NOT NULL,
  title      TEXT             NOT NULL,
  priority   SMALLINT         NOT NULL DEFAULT 0,   -- 0 low, 1 medium, 2 high
  tag        SMALLINT         NOT NULL DEFAULT -1,  -- -1 none .. 3 study
  position   DOUBLE PRECISION NOT NULL,
  poms       INTEGER          NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ      NOT NULL DEFAULT now(),

  CONSTRAINT cards_column_valid
    CHECK (column_key IN ('backlog', 'today', 'doing', 'done')),
  CONSTRAINT cards_priority_valid CHECK (priority BETWEEN 0 AND 2),
  CONSTRAINT cards_tag_valid      CHECK (tag BETWEEN -1 AND 3),
  CONSTRAINT cards_title_not_blank CHECK (length(btrim(title)) > 0),
  CONSTRAINT cards_poms_non_negative CHECK (poms >= 0)
);

CREATE TRIGGER cards_set_updated_at
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Index serving the main query (GET /board): filters by owner, groups by
-- column, comes out sorted. Without it, the listing becomes a seq scan once the
-- table grows past a few thousand rows.
CREATE INDEX cards_board_idx ON cards (user_id, column_key, position);

CREATE TABLE subtasks (
  id         UUID             PRIMARY KEY,
  card_id    UUID             NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title      TEXT             NOT NULL,
  done       BOOLEAN          NOT NULL DEFAULT FALSE,
  position   DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ      NOT NULL DEFAULT now(),

  CONSTRAINT subtasks_title_not_blank CHECK (length(btrim(title)) > 0)
);

CREATE INDEX subtasks_card_idx ON subtasks (card_id, position);

-- Goals in their own table: different XP, no subtasks, outside drag & drop.
CREATE TABLE goals (
  id         UUID             PRIMARY KEY,
  user_id    UUID             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope      TEXT             NOT NULL,
  title      TEXT             NOT NULL,
  done       BOOLEAN          NOT NULL DEFAULT FALSE,
  position   DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ      NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ      NOT NULL DEFAULT now(),

  CONSTRAINT goals_scope_valid CHECK (scope IN ('week', 'month')),
  CONSTRAINT goals_title_not_blank CHECK (length(btrim(title)) > 0)
);

CREATE TRIGGER goals_set_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX goals_user_idx ON goals (user_id, scope, position);

-- =============================================================================
-- XP (LEDGER)
-- =============================================================================
-- No `users.xp = 340`. Every award/reversal is a row. Consequences:
--   * 14-day histogram = GROUP BY day
--   * reversal = negative row (audit trail preserved)
--   * double credit = impossible, via unique constraint
--   * a wrong XP rule = recomputable from the events

CREATE TABLE xp_events (
  id              BIGSERIAL   PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- The user's LOCAL day (not UTC), computed server-side from users.timezone
  day             DATE        NOT NULL,
  delta           INTEGER     NOT NULL,
  reason          TEXT        NOT NULL,
  ref_id          UUID,       -- originating card, goal or focus session
  -- Comes from the client's Idempotency-Key header, or is derived by the server
  -- for rules it triggers itself (e.g. 'clean_day:2026-09-02').
  idempotency_key TEXT        NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT xp_events_reason_valid CHECK (reason IN (
    'card_done', 'card_undone',
    'goal_done', 'goal_undone',
    'subtask_done',
    'focus_session',
    'clean_day'
  )),
  CONSTRAINT xp_events_delta_not_zero CHECK (delta <> 0)
);

-- The constraint that carries the whole idempotency story. A resent POST
-- (retry, double click, duplicated tab) inserts the same key and the DATABASE
-- rejects it — two concurrent requests would both pass any in-code check
-- before either one writes.
CREATE UNIQUE INDEX xp_events_idempotency_uidx
  ON xp_events (user_id, idempotency_key);

-- Serves GET /stats (last 14 days) and the SUM for the total.
CREATE INDEX xp_events_user_day_idx ON xp_events (user_id, day);

-- Cache of what is expensive to derive per request. Rebuildable from xp_events.
CREATE TABLE user_stats (
  user_id     UUID    PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  xp_total    INTEGER NOT NULL DEFAULT 0,
  streak      INTEGER NOT NULL DEFAULT 0,
  last_xp_day DATE,

  CONSTRAINT user_stats_xp_non_negative CHECK (xp_total >= 0),
  CONSTRAINT user_stats_streak_non_negative CHECK (streak >= 0)
);

-- =============================================================================
-- FOCUS SESSIONS
-- =============================================================================
-- started_at is the server's. Without it, "I completed a 180-minute session"
-- is just a well-written POST.

CREATE TABLE focus_sessions (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id         UUID        NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  planned_minutes INTEGER     NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  paused_at       TIMESTAMPTZ,
  paused_ms       BIGINT      NOT NULL DEFAULT 0,  -- accumulated paused time
  ended_at        TIMESTAMPTZ,
  status          TEXT        NOT NULL DEFAULT 'running',

  CONSTRAINT focus_status_valid
    CHECK (status IN ('running', 'paused', 'completed', 'abandoned')),
  CONSTRAINT focus_minutes_range CHECK (planned_minutes BETWEEN 1 AND 180),
  CONSTRAINT focus_ended_when_terminal
    CHECK ((status IN ('completed', 'abandoned')) = (ended_at IS NOT NULL))
);

-- "Only one active timer at a time" enforced by the database, not the UI.
CREATE UNIQUE INDEX focus_one_active_per_user_uidx
  ON focus_sessions (user_id)
  WHERE status IN ('running', 'paused');

CREATE INDEX focus_sessions_card_idx ON focus_sessions (card_id);
